const { generateEvent } = require('../simulator/eventGenerator');

const subscriptions = {
  events: {
    subscribe: (_, __, { pubsub }) => {
      console.log('[Subscription] Client subscribed to events');

      // Send an event shortly after subscription so client gets data quickly
      setTimeout(() => {
        console.log('[Subscription] Sending initial event to new subscriber');
        generateEvent();
      }, 2000);

      return pubsub.asyncIterableIterator(['CONTROLLER_EVENTS']);
    },
  },
};

module.exports = { subscriptions };
