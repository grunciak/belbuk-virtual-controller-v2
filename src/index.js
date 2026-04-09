const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { execute, subscribe } = require('graphql');
const { PubSub } = require('graphql-subscriptions');
const { createServer } = require('http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const { typeDefs } = require('./schema/typeDefs');
const { resolvers } = require('./resolvers');
const { startMeasurementLoop } = require('./simulator/measurementGenerator');
const { startEventLoop, setPubSub } = require('./simulator/eventGenerator');
const { state } = require('./simulator/state');

const PORT = parseInt(process.env.PORT) || 2001;
const GRAPHQL_PATH = process.env.GRAPHQL_PATH || '/api/graphql.php';

// ===========================================================================
// WebSocket connection tracker — keeps Railway proxy alive via TCP ping,
// but NEVER terminates clients (Java/supervisor-center doesn't respond to
// TCP pong, and doesn't auto-reconnect if we kill the connection)
// ===========================================================================
const activeClients = new Set();

function trackClient(webSocket) {
  activeClients.add(webSocket);

  // TCP-level ping every 25 seconds — keeps Railway proxy alive
  // (Railway closes idle connections after ~30s without TCP activity)
  // We do NOT check for pong — Java clients may not respond to TCP ping,
  // and GraphQL-level keepAlive frames (ka every 5s) serve as the real
  // liveness signal via the subscriptions-transport-ws protocol
  const pingInterval = setInterval(() => {
    if (webSocket.readyState === 1) { // OPEN
      try {
        webSocket.ping();
      } catch (err) {
        console.log('[WS] Ping send failed, client likely gone');
        cleanup();
      }
    } else {
      cleanup();
    }
  }, 25000);

  webSocket.on('close', () => cleanup());
  webSocket.on('error', (err) => {
    console.log(`[WS] Error: ${err.message}`);
    cleanup();
  });

  function cleanup() {
    clearInterval(pingInterval);
    activeClients.delete(webSocket);
  }
}

async function start() {
  const pubsub = new PubSub();
  setPubSub(pubsub);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const app = express();
  const httpServer = createServer(app);

  // --- HTTP server keepalive settings ---
  // Prevent Node.js from closing idle HTTP connections too early
  httpServer.keepAliveTimeout = 120000; // 2 minutes
  httpServer.headersTimeout = 125000;   // slightly more than keepAliveTimeout

  // Legacy WebSocket subscription server (subscriptions-transport-ws)
  // Compatible with Apollo Client Java 2.x
  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      keepAlive: 5000, // GraphQL-level ka frame every 5s (was 10s)
      onConnect: (connectionParams, webSocket) => {
        console.log('[Subscription] Client connected via WebSocket');
        if (connectionParams?.Authorization) {
          const token = connectionParams.Authorization.substring(0, 30);
          console.log(`[Subscription] Connection params: {"Authorization":"${token}..."}`);
        }

        // Register client for tracking
        trackClient(webSocket);

        console.log(`[Subscription] Active clients: ${activeClients.size}`);
        return { pubsub };
      },
      // Called when client sends GQL_START (subscription operation)
      onOperation: (message, params) => {
        const query = (message.payload?.query || '').substring(0, 80);
        console.log(`[Subscription] Operation started: ${query}`);
        return params;
      },
      onDisconnect: (webSocket) => {
        activeClients.delete(webSocket);
        console.log(`[Subscription] Client disconnected. Active clients: ${activeClients.size}`);
      },
    },
    {
      server: httpServer,
      path: GRAPHQL_PATH,
    }
  );

  const server = new ApolloServer({
    schema,
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(
    GRAPHQL_PATH,
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async () => ({ pubsub }),
    })
  );

  // Health check — includes WebSocket status
  app.get('/health', (_, res) => res.json({
    status: 'ok',
    siteId: process.env.SITE_ID || 'VIRTUAL-001',
    activeWsClients: activeClients.size,
    unconfirmedEvents: state.unconfirmedEvents.length,
  }));

  httpServer.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('  Belbuk Virtual Controller');
    console.log('='.repeat(60));
    console.log(`  GraphQL:     http://localhost:${PORT}${GRAPHQL_PATH}`);
    console.log(`  WebSocket:   ws://localhost:${PORT}${GRAPHQL_PATH}`);
    console.log(`  Protocol:    subscriptions-transport-ws (legacy)`);
    console.log(`  Health:      http://localhost:${PORT}/health`);
    console.log('='.repeat(60));
    console.log(`  Site ID:     ${process.env.SITE_ID || 'VIRTUAL-001'}`);
    console.log(`  Auth:        ${process.env.AUTH_USER || 'scs'} / ${process.env.AUTH_PASSWORD || 'scs'}`);
    console.log('='.repeat(60));

    // Start simulators
    startMeasurementLoop();
    startEventLoop();

    // --- Level 3: Periodic connection health log every 60s ---
    setInterval(() => {
      const clients = activeClients.size;
      const unconfirmed = state.unconfirmedEvents.length;
      if (clients > 0) {
        console.log(`[Health] WS clients: ${clients} | Unconfirmed: ${unconfirmed}`);
      } else if (unconfirmed > 10) {
        console.log(`[Health] WARNING: No WS clients! Unconfirmed events: ${unconfirmed}`);
      }
    }, 60000);
  });
}

start().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});
