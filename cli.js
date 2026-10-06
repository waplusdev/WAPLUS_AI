#!/usr/bin/env node
require('dotenv').config();
const { startBot } = require('./bot');

const command = (process.argv[2] || 'start').toLowerCase();

const VALID_COMMANDS = ['start', 'pair'];

if (!VALID_COMMANDS.includes(command)) {
  console.log('Usage: waplus [start|pair]');
  console.log(' waplus start - Start with QR code');
  console.log(' waplus pair - Start with pairing code');
  process.exit(1);
}

if (command === 'pair') {
  process.env.REQUEST_PAIRING = 'true';
}

console.log(`[WaPlus] Starting in ${command} mode...`);

startBot().catch((err) => {
  console.error('[WaPlus] Startup failed:', err?.stack || err?.message || err);
  process.exit(1);
});