const SITE_ID = process.env.SITE_ID || 'VIRTUAL-001';

const inputs = [
  { id: '1', name: 'Czujnik ruchu - hol' },
  { id: '2', name: 'Czujnik dymu - serwerownia' },
  { id: '3', name: 'Czujnik otwarcia - parking' },
];

const outputs = [
  { id: '1', name: 'Syrena alarmowa - hol' },
  { id: '2', name: 'Sygnalizator optyczny - wejscie' },
  { id: '3', name: 'Elektrozaczep - wejscie techniczne' },
];

const readers = [
  { id: '1', name: 'Czytnik wejscie glowne IN' },
  { id: '2', name: 'Czytnik wejscie glowne OUT' },
  { id: '3', name: 'Czytnik wejscie techniczne IN' },
  { id: '4', name: 'Czytnik serwerownia IN' },
];

const zones = [
  {
    id: '1',
    name: 'Strefa glowna',
    controls: [readers[0], readers[1]],
    detectors: [
      { input: inputs[0], entryTime: 30, exitTime: 30 },
    ],
    alarms: [
      { output: outputs[0], time: 120 },
      { output: outputs[1], time: 120 },
    ],
  },
  {
    id: '2',
    name: 'Serwerownia',
    controls: [readers[3]],
    detectors: [
      { input: inputs[1], entryTime: 10, exitTime: 10 },
    ],
    alarms: [
      { output: outputs[0], time: 60 },
    ],
  },
  {
    id: '3',
    name: 'Parking',
    controls: [],
    detectors: [
      { input: inputs[2], entryTime: 60, exitTime: 60 },
    ],
    alarms: [
      { output: outputs[1], time: 180 },
    ],
  },
];

const portals = [
  {
    id: '1',
    name: 'Wejscie glowne',
    entry: readers[0],
    exit: readers[1],
    button: inputs[0],
    locking: outputs[2],
    sensor: inputs[0],
    release: 5,
    emergencies: [inputs[0]],
  },
  {
    id: '2',
    name: 'Wejscie techniczne',
    entry: readers[2],
    exit: null,
    button: null,
    locking: outputs[2],
    sensor: inputs[2],
    release: 5,
    emergencies: [],
  },
];

const faults = [
  { fault: 'TAMPER', inputs: [inputs[0]] },
  { fault: 'PRIME_POWER_SUPPLY', inputs: [inputs[1]] },
  { fault: 'HARDWARE', inputs: [inputs[2]] },
];

const eventTypes = [
  { code: 1, symbol: 'ARM', desc: 'Zone armed' },
  { code: 2, symbol: 'DISARM', desc: 'Zone disarmed' },
  { code: 3, symbol: 'ALARM', desc: 'Alarm triggered' },
  { code: 4, symbol: 'RESTORE', desc: 'Alarm restored' },
  { code: 5, symbol: 'ENTRY', desc: 'Portal entry' },
  { code: 6, symbol: 'EXIT', desc: 'Portal exit' },
  { code: 7, symbol: 'ACCESS_DENIED', desc: 'Access denied' },
  { code: 8, symbol: 'TAMPER', desc: 'Tamper detected' },
  { code: 9, symbol: 'FAULT', desc: 'System fault' },
  { code: 10, symbol: 'SENSOR_BLOCK', desc: 'Sensor blocked' },
  { code: 11, symbol: 'SENSOR_UNBLOCK', desc: 'Sensor unblocked' },
  { code: 12, symbol: 'EMERGENCY', desc: 'Emergency portal release' },
];

const schedulers = [
  {
    id: '1',
    name: 'Harmonogram dzienny',
    periods: [
      { day: 'MONDAY', start: '08:00', end: '18:00' },
      { day: 'TUESDAY', start: '08:00', end: '18:00' },
      { day: 'WEDNESDAY', start: '08:00', end: '18:00' },
      { day: 'THURSDAY', start: '08:00', end: '18:00' },
      { day: 'FRIDAY', start: '08:00', end: '16:00' },
    ],
  },
  {
    id: '2',
    name: 'Harmonogram nocny',
    periods: [
      { day: 'MONDAY', start: '18:00', end: '23:59' },
      { day: 'TUESDAY', start: '18:00', end: '23:59' },
      { day: 'WEDNESDAY', start: '18:00', end: '23:59' },
      { day: 'THURSDAY', start: '18:00', end: '23:59' },
      { day: 'FRIDAY', start: '16:00', end: '23:59' },
    ],
  },
];

const accessLevels = [
  {
    id: '1',
    name: 'Administrator',
    zones: [
      { zone: zones[0], scheduler: schedulers[0], arm: true, disarm: true, test: true },
      { zone: zones[1], scheduler: schedulers[0], arm: true, disarm: true, test: true },
      { zone: zones[2], scheduler: schedulers[0], arm: true, disarm: true, test: true },
    ],
    portals: [
      { portal: portals[0], scheduler: schedulers[0] },
      { portal: portals[1], scheduler: schedulers[0] },
    ],
  },
  {
    id: '2',
    name: 'Pracownik',
    zones: [
      { zone: zones[0], scheduler: schedulers[0], arm: false, disarm: true, test: false },
    ],
    portals: [
      { portal: portals[0], scheduler: schedulers[0] },
    ],
  },
  {
    id: '3',
    name: 'Gosc',
    zones: [],
    portals: [
      { portal: portals[0], scheduler: schedulers[0] },
    ],
  },
];

const users = [
  { id: '1', name: 'Jan Kowalski', credential: { card: 'A1B2C3D4', pin: '1234' }, expire: null, restore: false, override: false, access: [accessLevels[0]] },
  { id: '2', name: 'Anna Nowak', credential: { card: 'E5F6G7H8', pin: '5678' }, expire: null, restore: false, override: false, access: [accessLevels[1]] },
  { id: '3', name: 'Piotr Wisniewski', credential: { card: 'I9J0K1L2', pin: '9012' }, expire: null, restore: false, override: false, access: [accessLevels[1]] },
  { id: '4', name: 'Maria Zielinska', credential: { card: 'M3N4O5P6', pin: '3456' }, expire: '2026-12-31T23:59:59Z', restore: true, override: false, access: [accessLevels[2]] },
  { id: '5', name: 'Tomasz Lewandowski', credential: { card: 'Q7R8S9T0', pin: '7890' }, expire: null, restore: false, override: true, access: [accessLevels[0], accessLevels[1]] },
];

const points = [
  { id: '1', name: 'Temperatura - hol', type: 'ANALOG', family: 'TEMPERATURE', created: '2024-01-01T00:00:00Z', value: { type: 'DOUBLE', value: '{"val":"21.5"}' } },
  { id: '2', name: 'Temperatura - serwerownia', type: 'ANALOG', family: 'TEMPERATURE', created: '2024-01-01T00:00:00Z', value: { type: 'DOUBLE', value: '{"val":"19.2"}' } },
  { id: '3', name: 'Temperatura - parking', type: 'ANALOG', family: 'TEMPERATURE', created: '2024-01-01T00:00:00Z', value: { type: 'DOUBLE', value: '{"val":"12.8"}' } },
  { id: '4', name: 'Wilgotnosc - hol', type: 'ANALOG', family: 'HUMIDITY', created: '2024-01-01T00:00:00Z', value: { type: 'DOUBLE', value: '{"val":"45.0"}' } },
  { id: '5', name: 'Wilgotnosc - serwerownia', type: 'ANALOG', family: 'HUMIDITY', created: '2024-01-01T00:00:00Z', value: { type: 'DOUBLE', value: '{"val":"38.5"}' } },
  { id: '6', name: 'Napiecie - zasilacz glowny', type: 'ANALOG', family: 'VOLTAGE', created: '2024-01-01T00:00:00Z', value: { type: 'DOUBLE', value: '{"val":"230.1"}' } },
  { id: '7', name: 'Napiecie - zasilacz UPS', type: 'ANALOG', family: 'VOLTAGE', created: '2024-01-01T00:00:00Z', value: { type: 'DOUBLE', value: '{"val":"231.4"}' } },
  { id: '8', name: 'Drzwi - wejscie glowne', type: 'BINARY', family: 'DOOR', created: '2024-01-01T00:00:00Z', value: { type: 'BOOLEAN', value: '{"val":"false"}' } },
  { id: '9', name: 'Drzwi - wejscie techniczne', type: 'BINARY', family: 'DOOR', created: '2024-01-01T00:00:00Z', value: { type: 'BOOLEAN', value: '{"val":"false"}' } },
  { id: '10', name: 'Czujnik ruchu - hol', type: 'BINARY', family: 'MOTION', created: '2024-01-01T00:00:00Z', value: { type: 'BOOLEAN', value: '{"val":"false"}' } },
];

const groups = [
  {
    id: '1',
    name: 'Pomiary srodowiskowe',
    leader: points[0],
    points: [points[0], points[1], points[2], points[3], points[4]],
    groups: [],
  },
  {
    id: '2',
    name: 'Zasilanie',
    leader: points[5],
    points: [points[5], points[6]],
    groups: [],
  },
  {
    id: '3',
    name: 'Stan fizyczny',
    leader: points[7],
    points: [points[7], points[8], points[9]],
    groups: [],
  },
];

module.exports = {
  SITE_ID,
  inputs,
  outputs,
  readers,
  zones,
  portals,
  faults,
  eventTypes,
  schedulers,
  accessLevels,
  users,
  points,
  groups,
};
