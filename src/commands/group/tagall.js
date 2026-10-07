module.exports = {
  name: 'tagall',
  alias: ['everyone', 'all'],
  desc: 'Mention every member',
  usage: '.tagall <message>',
  group: true,
  admin: true,
  async run({ sock, m, ui, group, text }) {
    const { fonts } = ui;
    const members = group.participants;
    const jids = members.map((p) => p.id);

    const lines = members.map((p, i) => `${fonts.mono(String(i + 1).padStart(2, '0'))} ${p.admin ? '♛' : '◦'} @${p.id.split('@')[0]}`);

    const body = [
      `⟐ ${fonts.bold('ATTENTION EVERYONE')}`,
      `${fonts.smallCaps('called by')} ${m.pushName}`,
      '',
      `┌ ${fonts.smallCaps('message')}`,
      `└ ${text ? fonts.italic(text) : fonts.smallCaps('no message')}`,
      '',
      ...lines,
      '',
      `${fonts.smallCaps('total')} ⟶ ${fonts.bold(String(members.length))}`,
      ui.footer(),
    ].join('\n');

    await sock.sendMessage(m.chat, { text: body, mentions: jids }, { quoted: m.raw });
  },
};
