const { state } = require('../simulator/state');

const FLUSH_BATCH_SIZE = 10;
const FLUSH_BATCH_DELAY_MS = 500;

const subscriptions = {
  events: {
    subscribe: (_, __, { pubsub }) => {
      console.log('[Subscription] Client subscribed to events');

      // Flush unconfirmed events in small batches to avoid overwhelming the connection
      const unconfirmed = [...state.unconfirmedEvents];
      if (unconfirmed.length > 0) {
        console.log(`[Subscription] Flushing ${unconfirmed.length} unconfirmed events in batches of ${FLUSH_BATCH_SIZE}`);

        let batchIndex = 0;
        const flushBatch = () => {
          const start = batchIndex * FLUSH_BATCH_SIZE;
          const batch = unconfirmed.slice(start, start + FLUSH_BATCH_SIZE);

          if (batch.length === 0) {
            console.log(`[Subscription] Flush complete — all ${unconfirmed.length} events sent`);
            return;
          }

          for (const event of batch) {
            pubsub.publish('CONTROLLER_EVENTS', { events: [event] });
          }

          batchIndex++;
          setTimeout(flushBatch, FLUSH_BATCH_DELAY_MS);
        };

        // Start flushing after 1s delay (let subscription establish)
        setTimeout(flushBatch, 1000);
      }

      return pubsub.asyncIterator(['CONTROLLER_EVENTS']);
    },
  },
};

module.exports = { subscriptions };
