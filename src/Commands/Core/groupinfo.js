const { card } = require('../../core/ui');

module.exports = {
  name: 'groupinfo',
  alias: ['gcinfo', 'ginfo'],
  desc: 'Show current group metadata',
  category: 'Core',

  execute: async (sock, message, { reply, requireGroup, getGroupState }) => {
    requireGroup();

    const { metadata } = await getGroupState();
    if (!metadata) return reply(`_› Error: Unable to fetch group metadata_`);

    const created = metadata.creation ? new Date(metadata.creation * 1000).toLocaleString() : 'unknown';
    const owner = metadata.owner ? `@${metadata.owner.split('@')[0]}` : '`unknown`';

    return reply(
      card(
        `✦ ${metadata.subject || 'Group Info'} ✦`,
        [
          `› Members : \`${metadata.participants?.length || 0}\``,
          `› Admins  : \`${metadata.participants?.filter(p => p.admin).length || 0}\``,
          `› JID     : \`${message.chat}\``,
          `› Creator : ${owner}`,
          `› Created : \`${created}\``,
          `› Locked  : \`${metadata.announce ? 'Yes' : 'No'}\``,
        ],
        `_Desc:_ ${metadata.desc ? '```' + String(metadata.desc).slice(0, 300) + '```' : '_No description set_'}`
      )
    );
  },
};