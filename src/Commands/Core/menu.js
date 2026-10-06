const { getByCategory } = require('../../Plugin/xdnCmd');

module.exports = {
  name: 'menu',
  alias: ['help', 'commands', 'list'],
  desc: 'Show all installed commands',
  category: 'Core',
  cooldown: 1500,

  execute: async (sock, message, { reply, prefix, config }) => {
    const categories = getByCategory();
    const title = (config?.settings?.title || config?.branding?.title || 'WaPlus').toUpperCase();
    const version = config?.branding?.version || '1.0.0';
    const engine = config?.branding?.poweredBy || 'Baileys';
    const total = Object.values(categories).reduce((a, b) => a + (b?.length || 0), 0);

    // Supreme UI Builder
    let text = '';
    text += `┌─── *✦ ${title} ✦* ───\n`;
    text += `│  _Version : \`${version}\`_\n`;
    text += `│  _Engine  : \`${engine}\`_\n`;
    text += `│  _Prefix  : \`${prefix}\`_\n`;
    text += `│  _Total   : \`${total} commands\`_\n`;
    text += `└────────────────────\n\n`;

    const sortedCats = Object.keys(categories).sort();
    for (const cat of sortedCats) {
      const cmds = categories[cat];
      if (!cmds || !cmds.length) continue;

      text += `*┌─ ${cat.toUpperCase()}* _[${cmds.length}]_\n`;
      const list = cmds
        .map(c => {
          const n = typeof c === 'string' ? c : c.name || c.command || '';
          return n ? `\`${prefix}${n}\`` : null;
        })
        .filter(Boolean)
        .join('  ');

      // wrap nicely per 3
      const chunks = [];
      const arr = list.split('  ');
      for (let i = 0; i < arr.length; i += 4) {
        chunks.push(arr.slice(i, i + 4).join('  '));
      }

      for (let i = 0; i < chunks.length; i++) {
        const isLast = i === chunks.length - 1;
        text += `${isLast ? '└' : '├'}─ ${chunks[i]}\n`;
      }
      text += `\n`;
    }

    text += `*› Tip:* _Use \`${prefix}help <cmd>\` for details_\n`;
    text += `_› Eg:_ \`${prefix}ping\``;

    return reply(text.trim());
  },
};