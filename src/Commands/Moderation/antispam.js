const { get, set } = require('../../core/chatSettings');
const recent = new Map();

const LIMIT = 5; // messages
const WINDOW = 10000; // 10s
const MUTE_TIME = 30000;

const lastWarn = new Map();

module.exports = {
  name: 'antispam',
  alias: ['spamguard', 'antiflood'],
  desc: 'Limit repeated messages per group',
  category: 'Moderation',

  execute: async (sock, message, { args, reply, requireGroup, requireAdmin, prefix }) => {
    requireGroup();
    await requireAdmin();
    const a = (args[0] || 'status').toLowerCase();
    const on = get(message.chat, 'antispam', false);

    if (['on', 'enable', '1'].includes(a)) {
      set(message.chat, 'antispam', true);
      return reply(`*┌─ ✦ ANTISPAM ✦*\n├─ › Status : \`ON\`\n├─ › Limit : \`${LIMIT} msg / ${WINDOW/1000}s\`\n└─ _› Active_`);
    }
    if (['off', 'disable', '0'].includes(a)) {
      set(message.chat, 'antispam', false);
      return reply(`*┌─ ✦ ANTISPAM ✦*\n├─ › Status : \`OFF\`\n└─ _› Disabled_`);
    }

    return reply(
      `*┌─ ✦ ANTISPAM ✦*\n` +
      `├─ › Current : \`${on? 'ON' : 'OFF'}\`\n` +
      `├─ › Limit : \`${LIMIT} per ${WINDOW/1000}s\`\n` +
      `│\n` +
      `├─ \`${prefix}antispam on\`\n` +
      `└─ \`${prefix}antispam off\``
    );
  },

  onMessage: async (sock, message, { getGroupState }) => {
    if (!message.isGroup) return false;
    if (!get(message.chat, 'antispam', false)) return false;
    if (!message.text &&!message.caption) return false;

    const key = `${message.chat}:${message.sender}`;
    const now = Date.now();

    const arr = (recent.get(key) || []).filter(t => now - t < WINDOW);
    arr.push(now);
    recent.set(key, arr);

    if (arr.length < LIMIT) return false;

    const s = await getGroupState();
    if (s.isAdmin) return false;
    if (!s.isBotAdmin) return false;

    try {
      await sock.sendMessage(message.chat, { delete: message.key }).catch(()=>{});

      // warn only once per MUTE_TIME
      const lw = lastWarn.get(key) || 0;
      if (now - lw > MUTE_TIME) {
        lastWarn.set(key, now);
        await sock.sendMessage(message.chat, {
          text: `*┌─ ✦ SPAM BLOCKED ✦*\n├─ › User : \`@${message.sender.split('@')[0]}\`\n├─ › Count : \`${arr.length}/${LIMIT}\` in \`${WINDOW/1000}s\`\n└─ _› Slow down_`,
          mentions: [message.sender]
        });
      }
    } catch {}

    return true;
  },
};