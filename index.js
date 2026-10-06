require('dotenv').config();

// Allow `node index.js pair` as shortcut for pairing code
if (process.argv.includes('pair')) {
  process.env.REQUEST_PAIRING = 'true';
}

const { startBot, createBot } = require('./bot');

module.exports = { startBot, createBot };

// Only auto-start when file is run directly, not when required
if (require.main === module) {
  startBot().catch((err) => {
    console.error('[WaPlus] Startup failed:', err?.stack || err?.message || err);
    process.exit(1);
  });
}