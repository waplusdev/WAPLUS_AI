module.exports = {
  name: 'runtime',
  alias: ['uptime', 'status'],
  desc: 'Show process uptime and counters',
  category: 'Core',

  execute: async (sock, message, { reply }) => {
    const s = global.botStats || {};
    const up = process.uptime();

    const d = Math.floor(up / 86400);
    const h = Math.floor((up % 86400) / 3600);
    const m = Math.floor((up % 3600) / 60);
    const sec = Math.floor(up % 60);

    const fmt = `${d ? d + 'd ' : ''}${h ? h + 'h ' : ''}${m}m ${sec}s`;
    const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

    let text = '';
    text += `*┌─ ✦ SYSTEM STATUS ✦*\n`;
    text += `│\n`;
    text += `├─ › Uptime   : \`${fmt}\`\n`;
    text += `├─ › Messages : \`${s.messages || 0}\`\n`;
    text += `├─ › Commands : \`${s.commands || 0}\`\n`;
    text += `├─ › Memory   : \`${ram} MB\`\n`;
    text += `├─ › Node     : \`${process.version}\`\n`;
    text += `├─ › Platform : \`${process.platform}\`\n`;
    text += `│\n`;
    text += `└─ _› Running_`;

    return reply(text.trim());
  },
};