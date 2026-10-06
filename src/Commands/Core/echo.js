module.exports = {
  name: 'echo',
  desc: 'Echo text back to the chat',
  category: 'Core',
  usage: '.echo <text>',

  execute: async (sock, message, { text, reply, prefix }) => {
    if (!text || !text.trim()) {
      return reply(
        `*› ECHO*\n` +
        `_Usage:_ \`${prefix}echo <text>\`\n` +
        `_Example:_ \`${prefix}echo hello world\``
      );
    }

    return reply(`*› ECHO:*\n\`\`\`${text.trim()}\`\`\``);
  },
};