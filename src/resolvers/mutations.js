const { state } = require('../simulator/state');

const mutations = {
  echoEvent: () => {
    console.log('[Mutation] echoEvent');
    return true;
  },

  confirmEvent: (_, { id }) => {
    console.log(`[Mutation] confirmEvent: ${id}`);
    return id.map(eventId => {
      const idx = state.unconfirmedEvents.findIndex(e => e.id === eventId);
      if (idx >= 0) {
        state.unconfirmedEvents.splice(idx, 1);
        return { id: eventId, status: 'CONFIRMED' };
      }
      return { id: eventId, status: 'NOT_FOUND' };
    });
  },

  setSiteIdentifier: (_, { id }) => {
    console.log(`[Mutation] setSiteIdentifier: ${id}`);
    state.siteId = id;
    return true;
  },

  setTokenTTL: (_, { ttl }) => {
    console.log(`[Mutation] setTokenTTL: ${ttl}`);
    state.tokenTTL = ttl;
    return true;
  },

  // Zone control
  controlZone: (_, { zone, override, operator }) => {
    console.log(`[Mutation] controlZone: zone=${zone}, override=${override}, operator=${operator}`);
    const current = state.zoneStates[String(zone)];
    if (!current) return 'UNKNOWN';
    if (override) {
      state.zoneStates[String(zone)] = override;
      return override;
    }
    const newState = current === 'ZONE_ARMED' ? 'ZONE_DISARMED' : 'ZONE_ARMED';
    state.zoneStates[String(zone)] = newState;
    return newState;
  },

  restoreZone: (_, { zone, operator }) => {
    console.log(`[Mutation] restoreZone: zone=${zone}, operator=${operator}`);
    state.zoneStates[String(zone)] = 'ZONE_DISARMED';
    return 'RESTORED';
  },

  testZone: (_, { zone, operator }) => {
    console.log(`[Mutation] testZone: zone=${zone}, operator=${operator}`);
    const current = state.zoneStates[String(zone)];
    if (current === 'ZONE_ARMED') return 'DISARM_REQUIRED';
    return 'STARTED';
  },

  blockZone: (_, { zone, operator }) => {
    console.log(`[Mutation] blockZone: zone=${zone}, operator=${operator}`);
    const current = state.zoneStates[String(zone)];
    if (current === 'ZONE_ARMED') return 'DISARM_REQUIRED';
    return 'BLOCKED';
  },

  blockZoneSensor: (_, { sensor, operator }) => {
    console.log(`[Mutation] blockZoneSensor: sensor=${sensor}, operator=${operator}`);
    if (state.blockedSensors.has(String(sensor))) return 'ALREADY_BLOCKED';
    state.blockedSensors.add(String(sensor));
    return 'BLOCKED';
  },

  unblockZoneSensor: (_, { sensor, operator }) => {
    console.log(`[Mutation] unblockZoneSensor: sensor=${sensor}, operator=${operator}`);
    if (!state.blockedSensors.has(String(sensor))) return 'ALREADY_UNBLOCKED';
    state.blockedSensors.delete(String(sensor));
    return 'UNBLOCKED';
  },

  // Portal control
  releasePortal: (_, { portal, operator }) => {
    console.log(`[Mutation] releasePortal: portal=${portal}, operator=${operator}`);
    const current = state.portalStates[String(portal)];
    if (current === 'EMERGENCY') return 'EMERGENCY';
    return 'RELEASED';
  },

  emergencyPortal: (_, { portal, operator }) => {
    console.log(`[Mutation] emergencyPortal: portal=${portal}, operator=${operator}`);
    if (state.portalStates[String(portal)] === 'EMERGENCY') return 'ALREADY_EMERGENCY';
    state.portalStates[String(portal)] = 'EMERGENCY';
    return 'DONE';
  },

  restorePortal: (_, { portal, operator }) => {
    console.log(`[Mutation] restorePortal: portal=${portal}, operator=${operator}`);
    state.portalStates[String(portal)] = 'NORMAL';
    return 'RESTORED';
  },

  // Antipassback
  suspendAntipassback: (_, { operator }) => {
    console.log(`[Mutation] suspendAntipassback: operator=${operator}`);
    if (state.antipassbackSuspended) return 'ALREADY_SUSPENDED';
    state.antipassbackSuspended = true;
    return 'SUSPENDED';
  },

  resumeAntipassback: (_, { operator }) => {
    console.log(`[Mutation] resumeAntipassback: operator=${operator}`);
    if (!state.antipassbackSuspended) return 'ALREADY_RESUMED';
    state.antipassbackSuspended = false;
    return 'RESUMED';
  },

  reactivateAntipassback: (_, { credential, operator }) => {
    console.log(`[Mutation] reactivateAntipassback: credential=${credential}, operator=${operator}`);
    return 'REACTIVATED';
  },

  // Restore alarms
  restoreTamper: (_, { operator }) => {
    console.log(`[Mutation] restoreTamper: operator=${operator}`);
    return 'RESTORED';
  },
  restoreMains: (_, { operator }) => {
    console.log(`[Mutation] restoreMains: operator=${operator}`);
    return 'RESTORED';
  },
  restoreBackup: (_, { operator }) => {
    console.log(`[Mutation] restoreBackup: operator=${operator}`);
    return 'RESTORED';
  },
  restoreFault: (_, { operator }) => {
    console.log(`[Mutation] restoreFault: operator=${operator}`);
    return 'RESTORED';
  },

  // Scheduler CRUD
  createScheduler: (_, { input }) => {
    console.log(`[Mutation] createScheduler: ${input.length} items`);
    return input.map(s => {
      const scheduler = { id: String(state.nextSchedulerId++), name: s.name, periods: s.periods || [] };
      state.schedulers.push(scheduler);
      return scheduler;
    });
  },

  deleteScheduler: (_, { id }) => {
    console.log(`[Mutation] deleteScheduler: ${id}`);
    id.forEach(sid => {
      const idx = state.schedulers.findIndex(s => s.id === String(sid));
      if (idx >= 0) state.schedulers.splice(idx, 1);
    });
    return id;
  },

  modifyScheduler: (_, { input }) => {
    console.log(`[Mutation] modifyScheduler: ${input.length} items`);
    return input.map(s => {
      const existing = state.schedulers.find(sc => sc.id === String(s.id));
      if (!existing) return null;
      if (s.name) existing.name = s.name;
      if (s.periods) existing.periods = s.periods;
      return existing;
    }).filter(Boolean);
  },

  // SpecialDay CRUD
  createSpecialDay: (_, { input }) => {
    console.log(`[Mutation] createSpecialDay: ${input.length} items`);
    return input.map(s => {
      const day = { id: String(state.nextSpecialDayId++), date: s.date, day: s.day };
      state.specialDays.push(day);
      return day;
    });
  },

  deleteSpecialDay: (_, { id }) => {
    console.log(`[Mutation] deleteSpecialDay: ${id}`);
    id.forEach(sid => {
      const idx = state.specialDays.findIndex(s => s.id === String(sid));
      if (idx >= 0) state.specialDays.splice(idx, 1);
    });
    return id;
  },

  modifySpecialDay: (_, { input }) => {
    console.log(`[Mutation] modifySpecialDay: ${input.length} items`);
    return input.map(s => {
      const existing = state.specialDays.find(sd => sd.id === String(s.id));
      if (!existing) return null;
      if (s.date) existing.date = s.date;
      if (s.day) existing.day = s.day;
      return existing;
    }).filter(Boolean);
  },

  // AccessLevel CRUD
  createAccessLevel: (_, { input }) => {
    console.log(`[Mutation] createAccessLevel: ${input.length} items`);
    return input.map(a => {
      const level = {
        id: String(state.nextAccessLevelId++),
        name: a.name,
        zones: (a.zoneAuths || []).map(za => ({
          zone: state.zones.find(z => z.id === String(za.zone)) || { id: za.zone, name: 'Unknown' },
          scheduler: za.scheduler ? state.schedulers.find(s => s.id === String(za.scheduler)) : null,
          arm: za.arm, disarm: za.disarm, test: za.test,
        })),
        portals: (a.portalAuths || []).map(pa => ({
          portal: state.portals.find(p => p.id === String(pa.portal)) || { id: pa.portal, name: 'Unknown' },
          scheduler: pa.scheduler ? state.schedulers.find(s => s.id === String(pa.scheduler)) : null,
        })),
      };
      state.accessLevels.push(level);
      return level;
    });
  },

  deleteAccessLevel: (_, { id }) => {
    console.log(`[Mutation] deleteAccessLevel: ${id}`);
    id.forEach(aid => {
      const idx = state.accessLevels.findIndex(a => a.id === String(aid));
      if (idx >= 0) state.accessLevels.splice(idx, 1);
    });
    return id;
  },

  modifyAccessLevel: (_, { input }) => {
    console.log(`[Mutation] modifyAccessLevel: ${input.length} items`);
    return input.map(a => {
      const existing = state.accessLevels.find(al => al.id === String(a.id));
      if (!existing) return null;
      if (a.name) existing.name = a.name;
      return existing;
    }).filter(Boolean);
  },

  // User CRUD
  createUser: (_, { input }) => {
    console.log(`[Mutation] createUser: ${input.length} items`);
    return input.map(u => {
      const user = {
        id: String(state.nextUserId++),
        name: u.name,
        credential: u.credential || null,
        expire: u.expire || null,
        restore: u.restore,
        override: u.override,
        access: (u.access || []).map(aid => state.accessLevels.find(a => a.id === String(aid))).filter(Boolean),
      };
      state.users.push(user);
      return user;
    });
  },

  deleteUser: (_, { id }) => {
    console.log(`[Mutation] deleteUser: ${id}`);
    id.forEach(uid => {
      const idx = state.users.findIndex(u => u.id === String(uid));
      if (idx >= 0) state.users.splice(idx, 1);
    });
    return id;
  },

  modifyUser: (_, { input }) => {
    console.log(`[Mutation] modifyUser: ${input.length} items`);
    return input.map(u => {
      const existing = state.users.find(usr => usr.id === String(u.id));
      if (!existing) return null;
      if (u.name) existing.name = u.name;
      if (u.credential) existing.credential = u.credential;
      if (u.expire !== undefined) existing.expire = u.expire;
      if (u.restore !== undefined) existing.restore = u.restore;
      if (u.override !== undefined) existing.override = u.override;
      if (u.access) {
        existing.access = u.access.map(aid => state.accessLevels.find(a => a.id === String(aid))).filter(Boolean);
      }
      return existing;
    }).filter(Boolean);
  },

  updateAuthorization: (_, { input }) => {
    console.log('[Mutation] updateAuthorization');
    // Full authorization replacement
    return {
      schedulers: state.schedulers,
      derogations: state.specialDays,
      access: state.accessLevels,
      users: state.users,
    };
  },
};

module.exports = { mutations };
