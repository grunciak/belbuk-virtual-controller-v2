const subscriptions = {
  events: {
    subscribe: (_, __, { pubsub }) => {
      console.log('[Subscription] Client subscribed to events');
      return pubsub.asyncIterableIterator(['CONTROLLER_EVENTS']);
    },
  },
};

module.exports = { subscriptions };
