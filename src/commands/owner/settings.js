module.exports = {
  name: 'settings',
  alias: ['set', 'setprefix', 'mode'],
  desc: 'Prefix and bot mode',
  usage: '.settings prefix !  |  .settings mode private',
  owner: true,
  async run({ args, used, reply, db, config, ui, prefix, loader }) {
    const { fonts } = ui;
    // Shortcuts: ".setprefix !" and ".mode private" also work.
    const [key, value] = used === 'setprefix' ? ['prefix', args[0]] : used === 'mode' ? ['mode', args[0]] : [args[0]?.toLowerCase(), args[1]];

    if (key === 'prefix' && value) {
      if (value.length > 3) return reply(ui.notice('error', 'Too long', 'A prefix can have at most 3 characters.'));
      db.set('prefix', value);
      return reply(ui.notice('success', 'Prefix updated', `${fonts.smallCaps('now use')} ${fonts.mono(`${value}menu`)}`));
    }
    if (key === 'mode' && ['public', 'private'].includes(value?.toLowerCase())) {
      db.set('mode', value.toLowerCase());
      return reply(ui.notice('success', `Mode ${value}`, value.toLowerCase() === 'private' ? 'Only the owner can use the bot now.' : 'Everyone can use the bot now.'));
    }
    if (key === 'reload') {
      const total = loader.load().size;
      return reply(ui.notice('success', 'Commands reloaded', `${fonts.bold(String(total))} ${fonts.smallCaps('commands ready')}`));
    }

    await reply(
      ui.card({
        icon: '⊛',
        title: 'Settings',
        subtitle: 'owner control room',
        rows: [
          ['prefix', `「 ${prefix} 」`],
          ['mode', fonts.smallCaps(db.get('mode', config.mode))],
          ['cooldown', fonts.mono(`${config.cooldownMs}ms`)],
        ],
        body: [
          fonts.mono(`${prefix}settings prefix !`),
          fonts.mono(`${prefix}settings mode private`),
          fonts.mono(`${prefix}settings reload`),
        ].join('\n'),
      }),
    );
  },
};
