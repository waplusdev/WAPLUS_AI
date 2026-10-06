const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const readline = require('readline');
const fs = require('fs');
const chalk = require('chalk');
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const {
  default: makeWASocket,
  Browsers,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  jidDecode,
  downloadContentFromMessage,
  makeCacheableSignalKeyStore,
  getContentType,
} = require('@musteqeem/baileys');

const { smsg } = require('./library/serialize');
const { loadCommands } = require('./src/Plugin/xdnLoadCmd');
const { handleMessage } = require('./src/Plugin/xdnMsg');
const { xdnStatistic } = require('./src/Plugin/xdnStatistic');
const setupMessageHandler = require('./֎.js'); // <-- fix: you were missing this

const PAIRING_CODE = 'XADONITE'; // <--- your custom code
let activeStart = null;

function ask(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(query, (ans) => { rl.close(); resolve(ans); }));
}

function banner() {
  console.log(chalk.cyan(`
╔════════════════════════════════════╗
║            ✦ WaPlus ✦             ║
║  Developer-first WhatsApp Engine  ║
║  Plugins • AI • GitHub • SQLite    ║
╚════════════════════════════════════╝`));
}

function createBot(options = {}) {
  const app = options.app || express();
  const server = options.server || http.createServer(app);
  const io = options.io || socketIo(server, { cors: { origin: '*' } });

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.resolve(__dirname, 'Public')));
  app.get('/', (_, res) => res.sendFile(path.resolve(__dirname, 'Public/index.html')));

  global.botStats ||= { messages: 0, commands: 0, startTime: Date.now(), uptime: 0, connectedAt: null };
  global.botInstances ||= new Map();
  global.afk ||= new Map();

  return { app, server, io };
}

async function startBot(options = {}) {
  if (activeStart) return activeStart;

  activeStart = (async () => {
    require('dotenv').config();
    const config = require('./settings/config');
    banner();

    fs.mkdirSync(config.session, { recursive: true });
    fs.mkdirSync('./database', { recursive: true });
    if (!fs.existsSync('./database/runtime-config.json')) {
      fs.writeFileSync('./database/runtime-config.json', '{}');
    }

    loadCommands();

    const { app, server, io } = createBot(options);
    xdnStatistic(app, io);

    const port = Number(process.env.PORT || 3001);
    if (options.listen !== false) {
      await new Promise((resolve) => server.listen(port, resolve));
      console.log(chalk.green(`✓ Dashboard: http://localhost:${port}`));
    }

    const { state, saveCreds } = await useMultiFileAuthState(config.session);

    let version;
    try {
      version = (await fetchLatestBaileysVersion()).version;
    } catch {
      version = undefined;
    }

    const store = {
      messages: new Map(),
      contacts: new Map(),
      groupMetadata: new Map(),
      loadMessage: async (jid, id) => store.messages.get(`${jid}:${id}`) || null,
    };

    let reconnectTimer = null;
    let stopping = false;
    let pairingRequested = false;

    const connect = async () => {
      if (stopping) return;

      const sock = makeWASocket({
        logger: pino({ level: process.env.LOG_LEVEL || 'silent' }),
        printQRInTerminal: false,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        version,
        browser: Browsers.ubuntu('Chrome'),
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 10000,
        retryRequestDelayMs: 2000,
        maxMsgRetryCount: 5,
        markOnlineOnConnect: false,
        syncFullHistory: false,
        getMessage: async (key) => store.loadMessage(key.remoteJid, key.id),
      });

      sock.store = store;
      sock.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\\d+@/i.test(jid)) {
          const d = jidDecode(jid) || {};
          return d.user && d.server ? `${d.user}@${d.server}` : jid;
        }
        return jid;
      };

      sock.downloadMediaMessage = async (msg) => {
        const mtype = msg?.mtype || getContentType(msg?.message || msg) || '';
        const raw = msg?.message?.[mtype] || msg;
        const content = mtype.replace(/Message$/i, '').toLowerCase();
        const stream = await downloadContentFromMessage(raw, content);
        const chunks = [];
        for await (const c of stream) chunks.push(c);
        return Buffer.concat(chunks);
      };

      sock.sendText = (jid, text, quoted = '', options = {}) =>
        sock.sendMessage(jid, { text: String(text), ...options }, { quoted });

      sock.ev.on('creds.update', saveCreds);

      sock.ev.on('messages.upsert', ({ messages }) => {
        for (const msg of messages || []) {
          if (msg.key?.remoteJid && msg.key?.id) {
            store.messages.set(`${msg.key.remoteJid}:${msg.key.id}`, msg);
          }
        }
      });

      sock.ev.on('contacts.update', (items) => {
        for (const c of items || []) {
          if (c.id) store.contacts.set(c.id, { ...c });
        }
      });

      // Pairing with XADONITE
      const shouldPair = process.env.REQUEST_PAIRING === 'true' || config.status?.requestPairingCode;
      if (shouldPair && !state.creds.registered && !pairingRequested) {
        pairingRequested = true;
        try {
          let number = String(process.env.PAIRING_NUMBER || '').replace(/\\D/g, '');
          if (!number) {
            number = String(await ask(chalk.yellow('WhatsApp number (without +): '))).replace(/\\D/g, '');
          }
          if (!number) throw new Error('Phone number required for pairing');

          await new Promise((r) => setTimeout(r, 1500));

          // musteqeem/baileys supports custom code as 2nd param
          let code;
          try {
            code = await sock.requestPairingCode(number, PAIRING_CODE);
          } catch {
            // fallback for older version where 2nd arg not supported
            code = await sock.requestPairingCode(number);
          }

          console.log(
            chalk.cyan(`\n╔════════════════════════════╗\n║   WaPlus Pairing Code    ║\n║        ${String(code).padEnd(8)}        ║\n║  Custom: ${PAIRING_CODE}         ║\n╚════════════════════════════╝\n`)
          );
          console.log(chalk.white('Go to WhatsApp → Settings → Linked Devices → Link with phone number'));
        } catch (err) {
          console.error(chalk.red(`[PAIRING] Failed: ${err.message}`));
          pairingRequested = false; // allow retry
        }
      }

      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'connecting') {
          console.log(chalk.yellow('↻ Connecting to WhatsApp...'));
        }

        if (connection === 'open') {
          const id = sock.user?.id?.split(':')[0] || String(Date.now());
          global.botInstances.set(id, sock);
          global.botStats.connectedAt = Date.now();
          console.log(chalk.green(`✓ Connected as ${id}`));
          io.emit('bot-status', { status: 'connected', number: id });
        }

        if (connection === 'close' && !stopping) {
          const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
          console.log(chalk.yellow(`↻ Connection closed (${code || 'unknown'})`));

          if (code === DisconnectReason.loggedOut || code === DisconnectReason.badSession) {
            console.log(chalk.red('Session invalid. Delete session folder and pair again with XADONITE.'));
            return;
          }

          clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(connect, 3000);
        }
      });

      setupMessageHandler(sock, store, handleMessage, smsg);
      return sock;
    };

    const sock = await connect();

    io.on('connection', (socket) => {
      socket.emit('stats', global.botStats);
    });

    if (options.keepProcessHooks !== false) {
      const shutdown = async () => {
        if (stopping) return;
        stopping = true;
        clearTimeout(reconnectTimer);
        try { await sock?.end?.(new Error('shutdown')); } catch {}
        process.exit(0);
      };
      process.once('SIGINT', shutdown);
      process.once('SIGTERM', shutdown);
    }

    return {
      sock,
      app,
      server,
      io,
      store,
      stop: () => {
        stopping = true;
        clearTimeout(reconnectTimer);
        try { sock?.end?.(); } catch {}
        try { server.close(); } catch {}
      },
    };
  })();

  try {
    return await activeStart;
  } finally {
    activeStart = null;
  }
}

module.exports = { startBot, createBot };