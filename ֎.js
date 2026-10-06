const { getUnique } = require('./src/Plugin/xdnCmd');
const config = require('./settings/config');
const { getVar, setVar } = require('./src/Plugin/configManager');

/**
 * Message handler for @musteqeem/baileys
 */
module.exports = function setupMessageHandler(sock, store, handleMessage, smsg) {
  // Main message listener
  sock.ev.on('messages.upsert', async (chatUpdate) => {
    try {
      const type = chatUpdate?.type;
      const messages = chatUpdate?.messages;

      // musteqeem/baileys sends type = 'notify' or undefined on normal chat
      if (type && type !== 'notify') return;
      if (!messages || messages.length === 0) return;

      for (const raw of messages) {
        if (!raw) continue;
        if (raw.key?.fromMe) continue; // skip own messages early
        if (!raw.message) continue; // skip status/ephemeral empty

        try {
          const m = await smsg(sock, raw, store);
          if (!m) continue;

          if (global.botStats) {
            global.botStats.messages = (global.botStats.messages || 0) + 1;
          }

          // non-blocking but awaited to keep order
          await handleMessage(sock, m, store);
        } catch (e) {
          console.error('[MESSAGE:INNER]', e?.stack || e);
        }
      }
    } catch (e) {
      console.error('[MESSAGE:OUTER]', e?.stack || e);
    }
  });

  // Group events - for welcome/goodbye/antibot etc plugins
  sock.ev.on('group-participants.update', async (update) => {
    try {
      const plugins = getUnique();
      if (!plugins?.length) return;

      for (const plugin of plugins) {
        if (typeof plugin.onGroupParticipantsUpdate !== 'function') continue;
        
        try {
          await plugin.onGroupParticipantsUpdate(sock, update, {
            config,
            store,
            getVar,
            setVar
          });
        } catch (err) {
          console.error(`[GROUP:${plugin.name}]`, err?.stack || err);
        }
      }
    } catch (e) {
      console.error('[GROUP:OUTER]', e?.stack || e);
    }
  });
};