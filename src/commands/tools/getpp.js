module.exports = {
  name: 'getpp',
  alias: ['pp', 'avatar'],
  desc: 'Get a profile picture',
  usage: '.getpp @user  |  reply with .getpp',
  async run({ sock, m, ui, fail, target }) {
    const jid = target() || m.sender;
    const url = await sock.profilePictureUrl(jid, 'image').catch(() => null);
    if (!url) return fail('No picture', 'This user has no profile photo, or it is private.');

    const caption = [
      `◐ ${ui.fonts.bold('PROFILE PICTURE')}`,
      `${ui.fonts.smallCaps('user')} ⟶ @${jid.split('@')[0]}`,
      '',
      ui.footer(),
    ].join('\n');

    await sock.sendMessage(m.chat, { image: { url }, caption, mentions: [jid] }, { quoted: m.raw });
  },
};
