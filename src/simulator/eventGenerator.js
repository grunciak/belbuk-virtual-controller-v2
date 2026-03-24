const { v4: uuidv4 } = require('uuid');
const { state } = require('./state');

let pubsub = null;

function setPubSub(ps) {
  pubsub = ps;
}

function generateEvent() {
  const eventType = state.eventTypes[Math.floor(Math.random() * state.eventTypes.length)];
  const user = state.users[Math.floor(Math.random() * state.users.length)];
  const point = state.points[Math.floor(Math.random() * state.points.length)];

  const event = {
    site: state.siteId,
    id: String(state.nextEventId++),
    dateTime: new Date().toISOString(),
    trigger: {
      type: eventType.code,
      template: eventType.desc,
    },
    reason: point,
    points: [point],
    extensions: [
      { id: uuidv4(), type: eventType.code, value: eventType.symbol },
    ],
    user: eventType.code === 5 || eventType.code === 6 || eventType.code === 7 ? user : null,
    operator: null,
  };

  state.unconfirmedEvents.push(event);

  if (pubsub) {
    const payload = { events: [event] };
    console.log('[Event] Publishing payload:', JSON.stringify(payload, null, 2));
    pubsub.publish('CONTROLLER_EVENTS', payload);
  }

  console.log(`[Event] Generated: ${eventType.symbol} (${eventType.desc}) - event #${event.id}`);
  return event;
}

function startEventLoop(intervalMs) {
  const baseInterval = intervalMs || parseInt(process.env.EVENT_INTERVAL_MS) || 15000;
  console.log(`[Event] Starting generator, base interval: ${baseInterval}ms`);

  function scheduleNext() {
    const jitter = Math.floor(Math.random() * baseInterval);
    const delay = baseInterval + jitter;
    setTimeout(() => {
      generateEvent();
      scheduleNext();
    }, delay);
  }
  scheduleNext();
}

module.exports = { startEventLoop, generateEvent, setPubSub };
