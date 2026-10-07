const KIND = { imageMessage: 'image', videoMessage: 'video', audioMessage: 'audio' };

module.exports = {
  name: 'vv',
  alias: ['viewonce', 'reveal'],
  desc: 'Open view once media',
  usage: 'reply to a view once photo/video with .vv',
  async run({ sock, m, ui, fail }) {
    const q = m.quoted;
    const kind = KIND[q?.type];
    if (!q || !kind) return fail('Reply to view once', 'Reply to a view once photo, video or voice note with .vv');

    const media = await q.download();
    const originalCaption = q.message[q.type]?.caption;
    const caption = [
      `◎ ${ui.fonts.bold('VIEW ONCE REVEALED')}`,
      `${ui.fonts.smallCaps('kind')} ⟶ ${ui.fonts.mono(kind)}`,
      originalCaption ? `\n${originalCaption}` : '',
      '',
      ui.footer(),
    ].join('\n');

    const payload = kind === 'audio' ? { audio: media, mimetype: 'audio/ogg; codecs=opus', ptt: true } : { [kind]: media, caption };
    await sock.sendMessage(m.chat, payload, { quoted: m.raw });
  },
};
