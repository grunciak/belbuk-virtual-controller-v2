const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
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

  // WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: GRAPHQL_PATH,
  });

  const serverCleanup = useServer(
    {
      schema,
      context: () => ({ pubsub }),
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
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
