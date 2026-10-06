const { get, set } = require('../../core/chatSettings');

module.exports = {
  name: 'antitagall',
  alias: ['antimention', 'antitag', 'antihidetag'],
  desc: 'Block messages that mention too many members',
  category: 'Moderation',

  execute: async (sock, message, { args, reply, requireGroup, requireAdmin, prefix }) => {
    requireGroup();
    await requireAdmin();
    const a = (args[0] || 'status').toLowerCase();
    const on = get(message.chat, 'antitagall', false);

    if (['on', 'enable', '1'].includes(a)) {
      set(message.chat, 'antitagall', true);
      return reply(`*┌─ ✦ ANTITAG ✦*\n├─ › Status : \`ON\`\n├─ › Limit : \`> 4 mentions\`\n└─ _› Mass tags will be deleted_`);
    }
    if (['off', 'disable', '0'].includes(a)) {
      set(message.chat, 'antitagall', false);
      return reply(`*┌─ ✦ ANTITAG ✦*\n├─ › Status : \`OFF\`\n└─ _› Mass tags allowed_`);
    }

    return reply(
      `*┌─ ✦ ANTITAG ✦*\n` +
      `├─ › Current : \`${on? 'ON' : 'OFF'}\`\n` +
      `├─ › Limit : \`5+ mentions\`\n` +
      `│\n` +
      `├─ \`${prefix}antitagall on\`\n` +
      `└─ \`${prefix}antitagall off\``
    );
  },

  onMessage: async (sock, message, { getGroupState }) => {
    if (!message.isGroup) return false;
    if (!get(message.chat, 'antitagall', false)) return false;

    const count = (message.mentionedJid || []).length;
    const isMassContext = message.text?.includes('@all') || message.text?.includes('@everyone');
    if (count < 5 &&!isMassContext) return false;

    const s = await getGroupState();
    if (s.isAdmin) return false;
    if (!s.isBotAdmin) return false;

    try {
      await sock.sendMessage(message.chat, { delete: message.key }).catch(()=>{});
      await sock.sendMessage(message.chat, {
        text: `*┌─ ✦ TAGALL BLOCKED ✦*\n├─ › User : \`@${message.sender.split('@')[0]}\`\n├─ › Mentions : \`${count}\`\n└─ _› Mass tagging not allowed_`,
        mentions: [message.sender]
      });
    } catch {}

    return true;
  },
};