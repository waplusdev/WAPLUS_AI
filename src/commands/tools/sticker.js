const sharp = require('sharp');
const { Image } = require('node-webpmux');

/** Adds the pack name and author that WhatsApp shows under a sticker. */
async function withExif(webp, pack, author) {
  const json = Buffer.from(JSON.stringify({ 'sticker-pack-id': `waplus-${Date.now()}`, 'sticker-pack-name': pack, 'sticker-pack-publisher': author, emojis: [''] }));
  const head = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
  const exif = Buffer.concat([head, json]);
  exif.writeUIntLE(json.length, 14, 4);
  const img = new Image();
  await img.load(webp);
  img.exif = exif;
  return img.save(null);
}

module.exports = {
  name: 'sticker',
  alias: ['s', 'stiker'],
  desc: 'Image to sticker',
  usage: 'send or reply to an image with .sticker',
  async run({ sock, m, config, fail, text }) {
    const source = m.type === 'imageMessage' ? m : m.quoted?.type === 'imageMessage' || m.quoted?.type === 'stickerMessage' ? m.quoted : null;
    if (!source) return fail('No image found', 'Send an image with the caption .sticker, or reply to one.');

    const [pack, author] = (text || `${config.botName}|${m.pushName}`).split('|').map((s) => s.trim());
    const input = await source.download();
    const webp = await sharp(input)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 80 })
      .toBuffer();

    const sticker = await withExif(webp, pack || config.botName, author || m.pushName).catch(() => webp);
    await sock.sendMessage(m.chat, { sticker }, { quoted: m.raw });
  },
};
