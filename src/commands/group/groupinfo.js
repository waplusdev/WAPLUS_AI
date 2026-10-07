module.exports = {
  name: 'groupinfo',
  alias: ['ginfo', 'gc'],
  desc: 'Group details',
  group: true,
  async run({ sock, m, ui, group, reply }) {
    const { fonts } = ui;
    const meta = group || (await sock.groupMetadata(m.chat));
    const admins = meta.participants.filter((p) => p.admin);
    const created = meta.creation ? new Date(meta.creation * 1000).toLocaleDateString('en-GB') : 'unknown';
    const desc = (meta.desc || 'No description').toString().slice(0, 400);

    const text = ui.card({
      icon: '⬡',
      title: meta.subject,
      subtitle: 'group overview',
      rows: [
        ['members', fonts.bold(String(meta.participants.length))],
        ['admins', fonts.bold(String(admins.length))],
        ['created', fonts.mono(created)],
        ['messaging', meta.announce ? 'admins only' : 'everyone'],
        ['edit info', meta.restrict ? 'admins only' : 'everyone'],
      ],
      body: `${fonts.smallCaps('description')}\n${fonts.italic(desc)}`,
    });

    const pp = await sock.profilePictureUrl(m.chat, 'image').catch(() => null);
    if (pp) return sock.sendMessage(m.chat, { image: { url: pp }, caption: text }, { quoted: m.raw });
    return reply(text);
  },
};
