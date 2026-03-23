const { GraphQLScalarType, Kind } = require('graphql');

const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO 8601 DateTime',
  serialize(value) {
    return typeof value === 'string' ? value : new Date(value).toISOString();
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return ast.value;
    return null;
  },
});

const PeriodTime = new GraphQLScalarType({
  name: 'PeriodTime',
  description: 'Time period (HH:MM format)',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return ast.value;
    return null;
  },
});

const SpecialDate = new GraphQLScalarType({
  name: 'SpecialDate',
  description: 'Special date (YYYY-MM-DD format)',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return ast.value;
    return null;
  },
});

module.exports = { DateTime, PeriodTime, SpecialDate };
