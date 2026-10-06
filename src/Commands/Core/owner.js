module.exports = {
  name: 'owner',
  alias: ['creator', 'dev'],
  desc: 'Show the configured owner',
  category: 'Core',

  execute: async (sock, message, { reply, config }) => {
    const raw = config?.owner || config?.settings?.owner || config?.ownerNumber;
    if (!raw) return reply(`*┌─ ✦ OWNER ✦*\n└─ _⚠ OWNER_NUMBER is not configured_`);

    const num = String(raw).replace(/\D/g, '');
    const jid = `${num}@s.whatsapp.net`;

    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${config.settings?.title || 'Owner'}\nORG:WaPlus;\nTEL;type=CELL;type=VOICE;waid=${num}:+${num}\nEND:VCARD`;

    try {
      await sock.sendMessage(message.chat, {
        contacts: {
          displayName: `${config.settings?.title || 'Owner'}`,
          contacts: [{ vcard }]
        }
      });
    } catch {}

    let text = '';
    text += `*┌─ ✦ OWNER ✦*\n`;
    text += `│\n`;
    text += `├─ › Name : \`${config.settings?.title || 'WaPlus'} Owner\`\n`;
    text += `├─ › Number : \`+${num}\`\n`;
    text += `├─ › Link : _https://wa.me/${num}_\n`;
    text += `│\n`;
    text += `└─ _Tap contact above to save_`;

    return reply(text.trim());
  },
};