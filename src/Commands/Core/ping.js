module.exports = {
  name: 'ping',
  alias: ['speed', 'p'],
  desc: 'Check WhatsApp round-trip latency',
  category: 'Core',
  cooldown: 500,

  execute: async (sock, message, { reply }) => {
    const t = process.hrtime.bigint();
    const msg = await sock.sendMessage(message.chat, { text: '`› pinging...`' }, { quoted: message });

    const diff = Number(process.hrtime.bigint() - t) / 1e6; // ms

    return sock.sendMessage(message.chat, {
      text: `*› PONG* \`${diff.toFixed(0)}ms\`\n_› ${diff < 100 ? '⚡ ultra' : diff < 300 ? '✦ fast' : '› slow'}_`,
      edit: msg.key
    });
  },
};