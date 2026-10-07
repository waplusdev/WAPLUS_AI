module.exports = {
  name: 'alive',
  alias: ['bot', 'status'],
  desc: 'Is the bot online',
  async run({ sock, m, ui, config, prefix, premium }) {
    const { fonts } = ui;
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'good morning' : hour < 17 ? 'good afternoon' : 'good evening';

    const text = [
      `✦ ${fonts.bold(`${config.botName.toUpperCase()} IS ONLINE`)} ✦`,
      '',
      `${fonts.italic(`${greet[0].toUpperCase()}${greet.slice(1)}, ${m.pushName}.`)}`,
      `${fonts.smallCaps('all systems are running smoothly')}`,
      '',
      `  ⊹ ${fonts.smallCaps('engine')}   ${fonts.mono('@musteqeem/baileys')}`,
      `  ⊹ ${fonts.smallCaps('uptime')}   ${fonts.mono(ui.duration(process.uptime() * 1000))}`,
      `  ⊹ ${fonts.smallCaps('owner')}    ${fonts.mono(config.ownerName)}`,
      `  ⊹ ${fonts.smallCaps('node')}     ${fonts.mono(process.version)}`,
      '',
      `${fonts.smallCaps('type')} ${fonts.mono(`${prefix}menu`)} ${fonts.smallCaps('to explore')}`,
      '',
      ui.footer(),
    ].join('\n');

    await sock.sendButtons(
      m.chat,
      {
        image: premium.assets.banner || undefined,
        text,
        footer: config.botName,
        buttons: [
          { text: 'Open Menu', id: `${prefix}menu` },
          { text: 'Visit Website', url: config.links.website },
        ],
      },
      { quoted: premium.settings().verified ? 'verified' : m.raw },
    );
  },
};
