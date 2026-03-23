const { state } = require('./state');

function randomNoise(base, range) {
  return (base + (Math.random() - 0.5) * range).toFixed(1);
}

function updateMeasurements() {
  for (const point of state.points) {
    switch (point.family) {
      case 'TEMPERATURE':
        if (point.name.includes('serwerownia')) {
          point.value = { type: 'DOUBLE', value: randomNoise(19.5, 3) };
        } else if (point.name.includes('parking')) {
          point.value = { type: 'DOUBLE', value: randomNoise(14, 8) };
        } else {
          point.value = { type: 'DOUBLE', value: randomNoise(22, 4) };
        }
        break;
      case 'HUMIDITY':
        if (point.name.includes('serwerownia')) {
          point.value = { type: 'DOUBLE', value: randomNoise(38, 10) };
        } else {
          point.value = { type: 'DOUBLE', value: randomNoise(45, 15) };
        }
        break;
      case 'VOLTAGE':
        point.value = { type: 'DOUBLE', value: randomNoise(230, 6) };
        break;
      case 'DOOR':
        point.value = { type: 'BOOLEAN', value: Math.random() < 0.1 ? 'true' : 'false' };
        break;
      case 'MOTION':
        point.value = { type: 'BOOLEAN', value: Math.random() < 0.2 ? 'true' : 'false' };
        break;
    }
  }
}

function startMeasurementLoop(intervalMs) {
  const interval = intervalMs || parseInt(process.env.MEASUREMENT_INTERVAL_MS) || 5000;
  console.log(`[Measurement] Starting generator, interval: ${interval}ms`);
  setInterval(updateMeasurements, interval);
}

module.exports = { startMeasurementLoop, updateMeasurements };
