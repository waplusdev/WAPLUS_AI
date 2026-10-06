const { setVar, getVar } = require('../../Plugin/configManager');

module.exports = {
  name: 'setprefix',
  alias: ['prefix', 'setpref'],
  desc: 'Change the command prefix at runtime',
  category: 'Utility',

  execute: async (sock, message, { args, reply, requireOwner, prefix: current }) => {
    requireOwner();

    const p = args[0];

    if (p === undefined) {
      const cur = getVar('PREFIX', current) || '(none)';
      return reply(
        `*┌─ ✦ PREFIX ✦*\n` +
        `├─ › Current : \`${cur}\`\n` +
        `├─ › Usage : \`.setprefix <char>\`\n` +
        `├─ › Example : \`.setprefix!\`\n` +
        `└─ _› Use.setprefix none for no prefix_`
      );
    }

    let final = p;
    if (['none', 'off', '0', 'empty'].includes(p.toLowerCase())) final = '';

    if (final.length > 3) {
      return reply(`*┌─ ✦ ERROR ✦*\n└─ _Prefix must be 0-3 chars_`);
    }

    setVar('PREFIX', final);

    return reply(
      `*┌─ ✦ PREFIX ✦*\n` +
      `├─ › Old : \`${current || '(none)'}\`\n` +
      `├─ › New : \`${final || '(none)'}\`\n` +
      `└─ _› Live, no restart needed_`
    );
  },
};