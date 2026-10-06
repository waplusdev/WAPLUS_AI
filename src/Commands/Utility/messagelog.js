const { getDatabase } = require('../../Database/sqlite');
const { get, set } = require('../../core/chatSettings');

module.exports = {
  name: 'messagelog',
  alias: ['logging', 'logmsg', 'msglog'],
  desc: 'Opt-in SQLite message logging',
  category: 'Utility',

  execute: async (sock, message, { args, reply, requireOwner, prefix }) => {
    requireOwner();
    const a = (args[0] || 'status').toLowerCase();
    const on = get('global', 'logging', false);

    if (['on', 'enable', '1'].includes(a)) {
      set('global', 'logging', true);
      return reply(`*┌─ ✦ MESSAGELOG ✦*\n├─ › Status : \`ON\`\n└─ _› Logging to SQLite_`);
    }
    if (['off', 'disable', '0'].includes(a)) {
      set('global', 'logging', false);
      return reply(`*┌─ ✦ MESSAGELOG ✦*\n├─ › Status : \`OFF\`\n└─ _› Logging paused_`);
    }

    // stats
    let count = 0;
    try {
      const db = getDatabase();
      count = db.prepare('SELECT COUNT(*) as c FROM message_logs').get().c;
    } catch {}

    return reply(
      `*┌─ ✦ MESSAGELOG ✦*\n` +
      `├─ › Current : \`${on? 'ON' : 'OFF'}\`\n` +
      `├─ › Stored : \`${count}\`\n` +
      `│\n` +
      `├─ \`${prefix}messagelog on\`\n` +
      `└─ \`${prefix}messagelog off\``
    );
  },

  onMessage: async (sock, message) => {
    if (!get('global', 'logging', false)) return false;
    if (!message.text &&!message.caption) return false;

    try {
      const db = getDatabase();
      db.prepare(
        `INSERT INTO message_logs(message_id, chat_jid, sender_jid, body, is_group, created_at)
         VALUES(?,?,?,?,?,?)`
      ).run(
        message.key?.id || '',
        message.chat || '',
        message.sender || '',
        (message.text || message.caption || '').slice(0, 2000),
        message.isGroup? 1 : 0,
        Date.now()
      );
    } catch (e) {
      console.error('[LOG]', e.message);
    }

    return false; // don't block chain
  },
};