module.exports = {
  name: 'owner',
  alias: ['creator', 'dev'],
  desc: 'Contact the owner',
  async run({ sock, m, ui, config, reply }) {
    const number = config.ownerNumbers[0];
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${config.ownerName}`,
      `ORG:${config.botName} Owner;`,
      `item1.TEL;type=CELL;type=VOICE;waid=${number}:+${number}`,
      'item1.X-ABLabel:WhatsApp',
      'END:VCARD',
    ].join('\n');

    await sock.sendMessage(m.chat, { contacts: { displayName: config.ownerName, contacts: [{ vcard }] } }, { quoted: m.raw });

    await reply(
      ui.card({
        icon: '♛',
        title: 'Owner',
        subtitle: 'the mind behind the bot',
        rows: [
          ['name', ui.fonts.bold(config.ownerName)],
          ['number', ui.fonts.mono(`+${number}`)],
          ['bot', config.botName],
        ],
        body: ui.fonts.italic('Tap the contact card above to chat.'),
      }),
    );
  },
};
