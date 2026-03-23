const config = require('./config');

const state = {
  siteId: config.SITE_ID,
  tokenTTL: 30000,

  inputs: [...config.inputs],
  outputs: [...config.outputs],
  readers: [...config.readers],
  zones: config.zones.map(z => ({ ...z })),
  portals: config.portals.map(p => ({ ...p })),
  faults: [...config.faults],
  eventTypes: [...config.eventTypes],

  schedulers: config.schedulers.map(s => ({ ...s, periods: [...s.periods] })),
  specialDays: [],
  accessLevels: config.accessLevels.map(a => ({ ...a })),
  users: config.users.map(u => ({ ...u })),

  points: config.points.map(p => ({ ...p, value: { ...p.value } })),
  groups: config.groups.map(g => ({ ...g })),

  // Runtime state
  zoneStates: {
    '1': 'ZONE_DISARMED',
    '2': 'ZONE_ARMED',
    '3': 'ZONE_DISARMED',
  },
  portalStates: {
    '1': 'NORMAL',
    '2': 'NORMAL',
  },
  blockedSensors: new Set(),
  antipassbackSuspended: false,

  // Events buffer
  unconfirmedEvents: [],
  nextEventId: 1,
  nextSchedulerId: 3,
  nextSpecialDayId: 1,
  nextAccessLevelId: 4,
  nextUserId: 6,
};

function getConfiguration() {
  return {
    site: state.siteId,
    inputs: state.inputs,
    outputs: state.outputs,
    readers: state.readers,
    zones: state.zones,
    portals: state.portals,
    faults: state.faults,
    events: state.eventTypes,
    tokenTTL: state.tokenTTL,
  };
}

function getAuthorization() {
  return {
    schedulers: state.schedulers,
    derogations: state.specialDays,
    access: state.accessLevels,
    users: state.users,
  };
}

function getResource(pointIds, groupIds) {
  let pts = state.points;
  if (pointIds && pointIds.length > 0) {
    pts = pts.filter(p => pointIds.includes(p.id));
  }
  let grps = state.groups;
  if (groupIds && groupIds.length > 0) {
    grps = grps.filter(g => groupIds.includes(g.id));
  }
  // Update point references in groups to current state
  grps = grps.map(g => ({
    ...g,
    points: (g.points || []).map(gp => state.points.find(sp => sp.id === gp.id) || gp),
    leader: g.leader ? (state.points.find(sp => sp.id === g.leader.id) || g.leader) : null,
  }));
  return { points: pts, groups: grps };
}

module.exports = { state, getConfiguration, getAuthorization, getResource };
