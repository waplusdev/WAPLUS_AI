/**
 * Small web panel: live status + pair your bot from the browser.
 * Handy on hosting panels (Render, Railway, Pterodactyl) with no terminal.
 */
const path = require('path');
const express = require('express');
const config = require('../config');
const { state, requestPairing } = require('./connection');
const { stats } = require('./handler');
const loader = require('./loader');

function startPanel() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));
  app.use((_, res, next) => {
    res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'SAMEORIGIN' });
    next();
  });
  app.use(express.static(path.resolve(__dirname, '../public')));
  app.use(express.static(path.resolve(__dirname, '../assets')));

  app.get('/api/status', (_, res) => {
    res.json({
      bot: config.botName,
      version: config.version,
      status: state.status,
      number: state.number,
      pairingCode: state.pairingCode,
      uptime: Date.now() - stats.startedAt,
      messages: stats.messages,
      commands: stats.commands,
      totalCommands: loader.commands.size,
      memory: process.memoryUsage().rss,
    });
  });

  app.post('/api/pair', async (req, res) => {
    if (state.sock?.authState?.creds?.registered || state.status === 'online') {
      return res.status(409).json({ error: 'Bot is already linked.' });
    }
    if (process.env.PANEL_KEY && req.get('x-panel-key') !== process.env.PANEL_KEY) {
      return res.status(401).json({ error: 'Wrong panel key.' });
    }
    try {
      const code = await requestPairing(state.sock, req.body?.number);
      res.json({ code });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/health', (_, res) => res.send('ok'));
  app.listen(config.port, () => console.log(`  ◈ Panel   http://localhost:${config.port}`));
}

module.exports = { startPanel };
