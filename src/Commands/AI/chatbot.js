const { get, set } = require('../../core/chatSettings');
const { generate } = require('../../core/ai');

const URL_PREFIX = /^[!./#]/;
const MENTION_MODES = ['private', 'mention', 'all'];

module.exports = {
  name: 'chatbot',
  alias: ['ai', 'ask'],
  desc: 'Enable / disable AI auto-chat for this chat',
  category: 'AI',
  cooldown: 2500,

  // Command:.chatbot on/off |.ask <question>
  execute: async (sock, message, { args, text, reply, prefix }) => {
    const action = (args[0] || 'status').toLowerCase();

    if (['on', 'enable', 'true'].includes(action)) {
      set(message.chat, 'chatbot', true);
      return reply('🧠 AI chatbot *enabled* in this chat.\nJust type normally and I will reply.');
    }

    if (['off', 'disable', 'false'].includes(action)) {
      set(message.chat, 'chatbot', false);
      return reply('🧠 AI chatbot *disabled* in this chat.');
    }

    if (action === 'ask') {
      const query = text.replace(/^ask\s*/i, '').trim();
      if (!query) return reply(`Usage: ${prefix}ask <your question>`);
      try {
        await sock.sendPresenceUpdate('composing', message.chat);
        const answer = await generate(query);
        return reply(answer?.slice(0, 4000) || '❌ No response');
      } catch (e) {
        return reply(`❌ AI Error: ${e.message}`);
      } finally {
        sock.sendPresenceUpdate('available', message.chat).catch(() => {});
      }
    }

    // status
    const isOn = get(message.chat, 'chatbot', false);
    return reply(
      `🧠 Chatbot: *${isOn? 'ON' : 'OFF'}*\n\n` +
      `*Usage:*\n` +
      `${prefix}chatbot on - Enable\n` +
      `${prefix}chatbot off - Disable\n` +
      `${prefix}ask <q> - One-time ask`
    );
  },

  // Auto-reply hook
  onMessage: async (sock, message) => {
    try {
      if (!message?.text?.trim()) return false;
      if (!get(message.chat, 'chatbot', false)) return false;

      const text = message.text.trim();

      // Don't reply to commands
      if (URL_PREFIX.test(text)) return false;
      // If message starts with dot/prefix (your bot prefix), ignore
      if (message.isCmd) return false;

      const mode = (process.env.CHATBOT_MODE || 'all').toLowerCase();
      if (!MENTION_MODES.includes(mode)) return false;

      // Mode: private only
      if (mode === 'private' && message.isGroup) return false;

      // Mode: mention only in groups
      if (mode === 'mention' && message.isGroup) {
        const botNumber = String(sock.user?.id || '').split(':')[0];
        const mentioned = (message.mentionedJid || []).map(j => String(j).split('@')[0]);
        if (!mentioned.includes(botNumber)) return false;
      }

      await sock.sendPresenceUpdate('composing', message.chat);
      const answer = await generate(text);
      if (!answer) return false;

      await sock.sendMessage(
        message.chat,
        { text: answer.slice(0, 4000) },
        { quoted: message }
      );
      return true;
    } catch (e) {
      console.error('[CHATBOT]', e.message);
      return false;
    } finally {
      sock.sendPresenceUpdate('available', message.chat).catch(() => {});
    }
  },
};