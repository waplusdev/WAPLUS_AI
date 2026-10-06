const { get, set } = require('../../core/chatSettings');
const URL = /(https?:\/\/|www\.|t\.me\/|chat\.whatsapp\.com\/)\S+/i;

module.exports = {
  name: 'antilink',
  alias: ['linkguard', 'antilinks'],
  desc: 'Block links per group',
  category: 'Moderation',

  execute: async (sock, message, { args, reply, requireGroup, requireAdmin, prefix }) => {
    requireGroup();
    await requireAdmin();
    const a = (args[0] || 'status').toLowerCase();
    const on = get(message.chat, 'antilink', false);

    if (['on', 'enable', '1'].includes(a)) {
      set(message.chat, 'antilink', true);
      return reply(`*┌─ ✦ ANTILINK ✦*\n├─ › Status : \`ON\`\n└─ _› Links will be deleted_`);
    }

    if (['off', 'disable', '0'].includes(a)) {
      set(message.chat, 'antilink', false);
      return reply(`*┌─ ✦ ANTILINK ✦*\n├─ › Status : \`OFF\`\n└─ _› Links allowed_`);
    }

    return reply(
      `*┌─ ✦ ANTILINK ✦*\n` +
      `├─ › Current : \`${on? 'ON' : 'OFF'}\`\n` +
      `├─ › Pattern : \`URL | wa.me | t.me\`\n` +
      `│\n` +
      `├─ \`${prefix}antilink on\` — enable\n` +
      `└─ \`${prefix}antilink off\` — disable`
    );
  },

  onMessage: async (sock, message, { getGroupState }) => {
    if (!message.isGroup) return false;
    if (!get(message.chat, 'antilink', false)) return false;
    if (!URL.test(message.text || message.caption || '')) return false;

    const s = await getGroupState();
    if (s.isAdmin) return false;
    if (!s.isBotAdmin) return false;

    try {
      await sock.sendMessage(message.chat, { delete: message.key });

      await sock.sendMessage(message.chat, {
        text: `*┌─ ✦ LINK BLOCKED ✦*\n├─ › User : \`@${message.sender.split('@')[0]}\`\n└─ _› Links not allowed in this group_`,
        mentions: [message.sender]
      });
    } catch {}

    return true;
  },
};