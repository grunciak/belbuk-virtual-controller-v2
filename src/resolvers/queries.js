const { authenticate, refresh } = require('../auth/tokenManager');
const { getConfiguration, getAuthorization, getResource, state } = require('../simulator/state');

const queries = {
  getAuthToken: (_, { login, password }) => {
    console.log(`[Auth] Login attempt: ${login}`);
    return authenticate(login, password);
  },

  refreshAuthToken: () => {
    console.log('[Auth] Token refresh');
    return refresh();
  },

  configuration: () => {
    console.log('[Query] configuration');
    return getConfiguration();
  },

  authorization: () => {
    console.log('[Query] authorization');
    return getAuthorization();
  },

  resource: (_, { points, groups }) => {
    console.log(`[Query] resource (points: ${points || 'all'}, groups: ${groups || 'all'})`);
    return getResource(points, groups);
  },

  getUnconfirmedEvents: () => {
    const count = state.unconfirmedEvents.length;
    console.log(`[Query] getUnconfirmedEvents: ${count}`);
    return count;
  },
};

module.exports = { queries };
