const { queries } = require('./queries');
const { mutations } = require('./mutations');
const { subscriptions } = require('./subscriptions');
const { DateTime, PeriodTime, SpecialDate } = require('./scalars');

const resolvers = {
  DateTime,
  PeriodTime,
  SpecialDate,
  Query: queries,
  Mutation: mutations,
  Subscription: subscriptions,
};

module.exports = { resolvers };
