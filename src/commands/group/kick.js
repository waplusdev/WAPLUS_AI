module.exports = {
  name: 'kick',
  alias: ['remove'],
  desc: 'Remove a member',
  usage: '.kick @user  |  reply with .kick',
  group: true,
  admin: true,
  botAdmin: true,
  async run({ sock, m, ui, target, fail }) {
    const jid = target();
    if (!jid) return fail('Who should I remove?', 'Mention someone, reply to their message, or type their number.');

    const [result] = await sock.groupParticipantsUpdate(m.chat, [jid], 'remove');
    if (result?.status && result.status !== '200') return fail('Could not remove', `WhatsApp said: ${ui.fonts.mono(String(result.status))}`);

    await sock.sendMessage(
      m.chat,
      {
        text: [
          `⊘ ${ui.fonts.bold('MEMBER REMOVED')}`,
          `${ui.fonts.smallCaps('user')}  ⟶ @${jid.split('@')[0]}`,
          `${ui.fonts.smallCaps('by')}    ⟶ ${m.pushName}`,
          '',
          ui.footer(),
        ].join('\n'),
        mentions: [jid],
      },
      { quoted: m.raw },
    );
  },
};
