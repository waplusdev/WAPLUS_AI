/**
 * ╭──────────────────────────────────────────────╮
 *   WAPLUS · PREMIUM WHATSAPP STARTER
 *   Built on @musteqeem/baileys
 *
 *   npm install   →   cp .env.example .env   →   npm start
 * ╰──────────────────────────────────────────────╯
 */
const config = require('./config');
const loader = require('./src/loader');
const premium = require('./src/lib/premium');
const { connect } = require('./src/connection');
const { startPanel } = require('./src/panel');

async function main() {
  console.log(`\n  ⟡ ${config.botName.toUpperCase()}  ·  v${config.version}  ·  prefix "${config.prefix}"\n`);
  await premium.loadAssets();
  const commands = loader.load();
  console.log(`  ◈ Loaded  ${commands.size} commands`);
  startPanel();
  await connect();
}

process.on('unhandledRejection', (err) => console.error('  unhandled:', err?.message || err));

main().catch((err) => {
  console.error('  Startup failed:', err);
  process.exit(1);
});
