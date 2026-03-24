const { state } = require('../simulator/state');

const subscriptions = {
  events: {
    subscribe: (_, __, { pubsub }) => {
      console.log('[Subscription] Client subscribed to events');

      // Flush all unconfirmed events from buffer to new subscriber
      const unconfirmed = state.unconfirmedEvents;
      if (unconfirmed.length > 0) {
        console.log(`[Subscription] Flushing ${unconfirmed.length} unconfirmed events from buffer`);
        setTimeout(() => {
          // Send unconfirmed events in batches
          for (const event of unconfirmed) {
            pubsub.publish('CONTROLLER_EVENTS', { events: [event] });
          }
          console.log(`[Subscription] Flushed ${unconfirmed.length} buffered events`);
        }, 1000);
      }

      return pubsub.asyncIterator(['CONTROLLER_EVENTS']);
    },
  },
};

module.exports = { subscriptions };
