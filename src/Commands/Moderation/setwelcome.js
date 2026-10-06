const { get, set } = require('../../core/chatSettings');

module.exports = {
  name: 'setwelcome',
  alias: ['welcome', 'welcomer'],
  desc: 'Enable/disable automatic group welcome',
  category: 'Moderation',

  execute: async (sock, message, { args, reply, requireGroup, requireAdmin, prefix }) => {
    requireGroup();
    await requireAdmin();
    const a = (args[0] || 'status').toLowerCase();
    const on = get(message.chat, 'welcome', false);

    if (['on', 'enable', '1'].includes(a)) {
      set(message.chat, 'welcome', true);
      return reply(`*┌─ ✦ WELCOME ✦*\n├─ › Status : \`ON\`\n└─ _› New members will be greeted_`);
    }
    if (['off', 'disable', '0'].includes(a)) {
      set(message.chat, 'welcome', false);
      return reply(`*┌─ ✦ WELCOME ✦*\n├─ › Status : \`OFF\`\n└─ _› Greeting disabled_`);
    }

    return reply(
      `*┌─ ✦ WELCOME ✦*\n` +
      `├─ › Current : \`${on? 'ON' : 'OFF'}\`\n` +
      `│\n` +
      `├─ \`${prefix}welcome on\`\n` +
      `└─ \`${prefix}welcome off\``
    );
  },

  onGroupParticipantsUpdate: async (sock, update) => {
    if (update.action!== 'add') return;
    if (!get(update.id, 'welcome', false)) return;

    const meta = await sock.groupMetadata(update.id).catch(() => null);
    const people = (update.participants || []).map(p => typeof p === 'string'? p : p.id).filter(Boolean);
    if (!people.length) return;

    const mentionsText = people.map(j => `@${j.split('@')[0]}`).join(', ');

    let text = '';
    text += `*┌─ ✦ WELCOME ✦*\n`;
    text += `│\n`;
    text += `├─ › Hi ${mentionsText}\n`;
    text += `├─ › Group : \`${meta?.subject || 'this group'}\`\n`;
    text += `│\n`;
    text += `├─ _› Read rules & enjoy your stay_\n`;
    text += `└─ _› Members: ${meta?.participants?.length || '—'}_`;

    await sock.sendMessage(update.id, {
      text: text.trim(),
      mentions: people
    }).catch(()=>{});
  },
};