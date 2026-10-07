const ai = require('../../lib/ai');

module.exports = {
  name: 'ai',
  alias: ['ask', 'gpt', 'chat'],
  desc: 'Chat with AI',
  usage: '.ai <question>  |  .ai reset',
  async run({ m, text, reply, ui, prefix }) {
    const { fonts } = ui;

    if (text.toLowerCase() === 'reset') {
      ai.reset(m.chat);
      return reply(ui.notice('success', 'Memory cleared', 'The AI forgot this conversation.'));
    }

    const question = [m.quoted?.body && `Context: ${m.quoted.body}`, text].filter(Boolean).join('\n\n');
    if (!question) {
      return reply(ui.notice('info', 'Ask me anything', `${fonts.mono(`${prefix}ai what is javascript`)}\n${fonts.smallCaps('or reply to a message with')} ${fonts.mono(`${prefix}ai explain`)}`));
    }

    const { answer, provider } = await ai.ask(m.chat, question);

    await reply(
      [
        `⟢ ${fonts.bold('WAPLUS AI')}  ${fonts.smallCaps(`· ${provider}`)}`,
        ui.DOTS,
        '',
        answer,
        '',
        ui.DOTS,
        `${fonts.smallCaps('memory on ·')} ${fonts.mono(`${prefix}ai reset`)}`,
        ui.footer(),
      ].join('\n'),
    );
  },
};
