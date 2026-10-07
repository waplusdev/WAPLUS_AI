const FEATURES = {
  ai: { key: 'aiBadge', label: 'ai badge', info: 'AI label on bot messages in private chats' },
  verified: { key: 'verified', label: 'verified quote', info: 'blue tick contact quoted on replies' },
  channel: { key: 'channel', label: 'channel forward', info: '"forwarded from channel" header (needs CHANNEL_JID)' },
  meta: { key: 'metaLabel', label: 'meta label', info: 'secured by Meta business label' },
};

module.exports = {
  name: 'premium',
  alias: ['badge', 'badges'],
  desc: 'Toggle premium badges',
  usage: '.premium ai on  |  .premium verified off',
  owner: true,
  async run({ args, reply, db, premium, ui, prefix }) {
    const { fonts } = ui;
    const [name, value] = args.map((a) => a.toLowerCase());
    const feature = FEATURES[name];

    if (feature && ['on', 'off'].includes(value)) {
      db.set('premium', { ...db.get('premium', {}), [feature.key]: value === 'on' });
      return reply(ui.notice('success', `${feature.label} ${value}`, fonts.italic(feature.info)));
    }

    const current = premium.settings();
    const lines = Object.entries(FEATURES).map(([id, f]) => {
      const on = current[f.key];
      return `${on ? '◉' : '○'} ${fonts.bold(f.label.toUpperCase())}  ${fonts.smallCaps(on ? 'on' : 'off')}\n   ${fonts.mono(`${prefix}premium ${id} ${on ? 'off' : 'on'}`)}`;
    });

    await reply(
      [
        `✧ ${fonts.bold('PREMIUM CONTROL')}`,
        `${fonts.smallCaps('the badges that make your bot look official')}`,
        ui.DOTS,
        '',
        lines.join('\n\n'),
        '',
        ui.DOTS,
        ui.footer(),
      ].join('\n'),
    );
  },
};
