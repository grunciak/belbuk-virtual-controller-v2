const subscriptions = {
  events: {
    subscribe: (_, __, { pubsub }) => {
      console.log('[Subscription] Client subscribed to events');
      const asyncIterable = pubsub.asyncIterableIterator(['CONTROLLER_EVENTS']);
      // subscriptions-transport-ws needs Symbol.asyncIterator on the object
      // graphql-subscriptions v2 returns an AsyncGenerator which already has it
      return asyncIterable;
    },
  },
};

module.exports = { subscriptions };
