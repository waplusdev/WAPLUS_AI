const ORDER = ['general', 'ai', 'tools', 'group', 'owner'];

module.exports = {
  name: 'menu',
  alias: ['help', 'list'],
  desc: 'Show every command',
  async run({ sock, m, ui, config, db, prefix, loader, premium }) {
    const { fonts } = ui;
    const groups = loader.byCategory();
    const names = [...ORDER.filter((c) => groups[c]), ...Object.keys(groups).filter((c) => !ORDER.includes(c))];

    const header = [
      `   ⟡ ${fonts.bold(fonts.spaced(config.botName.toUpperCase()))} ⟡`,
      `   ${fonts.smallCaps('premium whatsapp engine')}`,
      '',
      `╭${ui.LINE}╮`,
      ui.row('user', m.pushName),
      ui.row('prefix', `「 ${prefix} 」`),
      ui.row('mode', fonts.smallCaps(db.get('mode', config.mode))),
      ui.row('uptime', ui.duration(process.uptime() * 1000)),
      ui.row('commands', fonts.bold(String(loader.commands.size))),
      `╰${ui.LINE}╯`,
    ].join('\n');

    const sections = names.map((cat) =>
      ui.section(
        cat,
        groups[cat].map((c) => `▸ ${fonts.mono(prefix + c.name)}  ${fonts.smallCaps(c.desc || '')}`),
      ),
    );

    const caption = [header, ...sections, ui.footer()].join('\n\n');

    await sock.sendButtons(
      m.chat,
      {
        image: premium.assets.banner || undefined,
        text: caption,
        footer: `${config.botName} · ${config.ownerName}`,
        buttons: [
          { text: 'Ping', id: `${prefix}ping` },
          { text: 'Alive', id: `${prefix}alive` },
          { text: 'Owner', id: `${prefix}owner` },
        ],
      },
      { quoted: premium.settings().verified ? 'verified' : m.raw },
    );
  },
};
