const subscriptions = {
  events: {
    subscribe: (_, __, { pubsub }) => {
      console.log('[Subscription] Client subscribed to events');
      return pubsub.asyncIterator(['CONTROLLER_EVENTS']);
    },
  },
};

module.exports = { subscriptions };
