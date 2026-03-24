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

const PORT = parseInt(process.env.PORT) || 2001;
const GRAPHQL_PATH = process.env.GRAPHQL_PATH || '/api/graphql.php';

async function start() {
  const pubsub = new PubSub();
  setPubSub(pubsub);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const app = express();
  const httpServer = createServer(app);

  // Wrap execute to log errors in subscription responses
  const wrappedExecute = async (...args) => {
    const result = await execute(...args);
    if (result.errors) {
      console.error('[Subscription] GraphQL execution errors:', JSON.stringify(result.errors, null, 2));
    }
    if (result.data) {
      console.log('[Subscription] GraphQL execution data keys:', Object.keys(result.data));
      if (result.data.events === null) {
        console.error('[Subscription] events is NULL in response!');
      }
    }
    return result;
  };

  // Legacy WebSocket subscription server (subscriptions-transport-ws)
  // Compatible with Apollo Client Java 2.x
  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute: wrappedExecute,
      subscribe,
      keepAlive: 10000, // Send keep-alive every 10s (Apollo Client Java expects heartbeat)
      onConnect: (connectionParams, webSocket) => {
        console.log('[Subscription] Client connected via WebSocket');
        console.log('[Subscription] Connection params:', JSON.stringify(connectionParams));
        return { pubsub };
      },
      onDisconnect: () => {
        console.log('[Subscription] Client disconnected');
      },
      onOperation: (message, params) => {
        console.log('[Subscription] Operation started:', message.payload?.query?.substring(0, 80));
        return params;
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

  // Health check
  app.get('/health', (_, res) => res.json({ status: 'ok', siteId: process.env.SITE_ID || 'VIRTUAL-001' }));

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
  });
}

start().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});
