/**
 * ╭──────────────────────────────────────────────╮
 *   WAPLUS · CONNECTION
 *   Logs in with a pairing code, saves the session,
 *   and reconnects automatically if it drops.
 * ╰──────────────────────────────────────────────╯
 */
const fs = require('fs');
const pino = require('pino');
const readline = require('readline');
const { Boom } = require('@hapi/boom');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  DisconnectReason,
  Browsers,
} = require('@musteqeem/baileys');

const config = require('../config');
const premium = require('./lib/premium');
const { handle } = require('./handler');

const state = { sock: null, status: 'starting', pairingCode: null, number: null, connectedAt: null };
const logger = pino({ level: process.env.LOG_LEVEL || 'silent' });

const ask = (q) =>
  new Promise((resolve) => {
    if (!process.stdin.isTTY) return resolve('');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(q, (a) => { rl.close(); resolve(a); });
  });

async function requestPairing(sock, number) {
  const clean = String(number).replace(/\D/g, '');
  if (!clean) throw new Error('Phone number required (country code, no +)');
  const custom = /^[A-Z0-9]{8}$/i.test(config.pairingCode) ? config.pairingCode.toUpperCase() : undefined;
  const code = await sock.requestPairingCode(clean, custom);
  state.pairingCode = code?.match(/.{1,4}/g)?.join('-') || code;
  state.status = 'pairing';
  console.log(`\n  ╭──────────────────────────╮\n  │  PAIRING CODE  ${state.pairingCode.padEnd(10)}│\n  ╰──────────────────────────╯`);
  console.log('  WhatsApp › Linked devices › Link with phone number\n');
  return state.pairingCode;
}

async function connect() {
  fs.mkdirSync(config.sessionDir, { recursive: true });
  const { state: auth, saveCreds } = await useMultiFileAuthState(config.sessionDir);
  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: undefined }));

  const sock = makeWASocket({
    version,
    logger,
    auth: { creds: auth.creds, keys: makeCacheableSignalKeyStore(auth.keys, logger) },
    browser: Browsers.ubuntu('Chrome'),
    markOnlineOnConnect: false,
    syncFullHistory: false,
    printQRInTerminal: false,
  });
  premium.install(sock);
  state.sock = sock;
  state.status = 'connecting';

  sock.ev.on('creds.update', saveCreds);

  if (!auth.creds.registered) {
    setTimeout(async () => {
      const number = config.pairingNumber || (await ask('  Bot WhatsApp number (e.g. 2348012345678): '));
      if (!number) {
        state.status = 'waiting';
        console.log('  Open the web panel to pair, or set PAIRING_NUMBER in .env');
        return;
      }
      requestPairing(sock, number).catch((err) => console.error('  Pairing failed:', err.message));
    }, 2500);
  }

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      state.status = 'online';
      state.pairingCode = null;
      state.number = sock.user?.id?.split(':')[0];
      state.connectedAt = Date.now();
      console.log(`  ✓ Online as +${state.number}`);
    }
    if (connection === 'close') {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        state.status = 'logged-out';
        console.log('  ✗ Logged out. Delete the session folder and start again.');
        return;
      }
      state.status = 'reconnecting';
      console.log(`  ↻ Reconnecting (${code || 'unknown'})`);
      setTimeout(connect, 3000);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) await handle(sock, msg).catch((e) => console.error('  handler:', e.message));
  });

  return sock;
}

module.exports = { connect, state, requestPairing };
