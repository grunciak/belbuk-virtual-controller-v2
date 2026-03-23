const { v4: uuidv4 } = require('uuid');

const AUTH_USER = process.env.AUTH_USER || 'scs';
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'scs';

const tokens = new Map();

function generateToken() {
  return uuidv4() + '-' + Date.now().toString(36);
}

function authenticate(login, password) {
  if (login !== AUTH_USER || password !== AUTH_PASSWORD) {
    throw new Error('Invalid credentials');
  }
  const mainToken = generateToken();
  const refreshToken = generateToken();
  tokens.set(mainToken, { refreshToken, createdAt: Date.now() });
  return { mainToken, refreshToken };
}

function refresh(mainToken) {
  // Accept any token for simplicity in simulation
  const newMainToken = generateToken();
  const newRefreshToken = generateToken();
  tokens.set(newMainToken, { refreshToken: newRefreshToken, createdAt: Date.now() });
  return { mainToken: newMainToken, refreshToken: newRefreshToken };
}

module.exports = { authenticate, refresh };
