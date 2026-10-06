const { getDatabase } = require('../../Database/sqlite');

module.exports = {
  name: 'note',
  alias: ['notes', 'notepad', 'memo'],
  desc: 'Save, list and clear per-chat notes',
  category: 'Utility',

  execute: async (sock, message, { args, text, reply, prefix }) => {
    const db = getDatabase();
    const chat = message.chat;
    const author = message.sender || '';
    const action = (args[0] || 'list').toLowerCase();

    if (action === 'add') {
      const body = text.replace(/^add\s*/i, '').trim();
      if (!body) return reply(`*┌─ ✦ NOTE ✦*\n└─ _Usage: ${prefix}note add <text>_`);
      db.prepare('INSERT INTO notes(chat_jid, author_jid, body, created_at) VALUES(?,?,?,?)')
       .run(chat, author, body.slice(0, 1000), Date.now());
      return reply(`*┌─ ✦ NOTE ✦*\n├─ › Saved\n└─ _${body.slice(0, 80)}_`);
    }

    if (['clear', 'delete', 'del', 'wipe'].includes(action)) {
      const id = args[1];
      if (id && /^\d+$/.test(id)) {
        db.prepare('DELETE FROM notes WHERE chat_jid=? AND id=?').run(chat, Number(id));
        return reply(`*┌─ ✦ NOTE ✦*\n└─ _› Deleted #${id}_`);
      }
      db.prepare('DELETE FROM notes WHERE chat_jid=?').run(chat);
      return reply(`*┌─ ✦ NOTE ✦*\n└─ _› All notes cleared_`);
    }

    if (['list', 'all', ''].includes(action)) {
      const rows = db.prepare('SELECT id,body,created_at FROM notes WHERE chat_jid=? ORDER BY id DESC LIMIT 15').all(chat);
      if (!rows.length) return reply(`*┌─ ✦ NOTES ✦*\n└─ _No notes yet. ${prefix}note add <text>_`);

      let out = `*┌─ ✦ NOTES [${rows.length}] ✦*\n│\n`;
      rows.forEach(r => {
        const date = new Date(r.created_at).toLocaleDateString();
        out += `├─ › \`#${r.id}\` ${r.body.slice(0, 70)}\n`;
        out += `│ _${date}_\n`;
      });
      out += `│\n└─ _› ${prefix}note clear / ${prefix}note clear <id>_`;
      return reply(out.trim());
    }

    return reply(`*┌─ ✦ NOTE ✦*\n├─ \`${prefix}note add <text>\`\n├─ \`${prefix}note list\`\n└─ \`${prefix}note clear [id]\``);
  },
};