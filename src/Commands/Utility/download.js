module.exports = {
  name: 'download',
  alias: ['dl', 'media', 'dlx'],
  desc: 'Download media through your authorized API adapter',
  category: 'Utility',

  execute: async (sock, message, { text, reply, prefix }) => {
    const url = text.trim().split(/\s+/)[0];
    const api = process.env.MEDIA_API_URL;

    if (!url) {
      return reply(
        `*┌─ ✦ DOWNLOAD ✦*\n` +
        `├─ › Usage : \`${prefix}download <url>\`\n` +
        `├─ › Supports : \`tiktok | ig | fb | yt | twitter | etc\`\n` +
        `└─ _› Requires MEDIA_API_URL in.env_`
      );
    }
    if (!api) return reply(`*┌─ ✦ ERROR ✦*\n└─ _MEDIA_API_URL not set in.env_`);

    if (!/^https?:\/\//i.test(url)) return reply(`_› Invalid URL_`);

    try {
      await sock.sendMessage(message.chat, { react: { text: '›', key: message.key } }).catch(()=>{});

      // › fetch from adapter
      const r = await fetch(`${api}?url=${encodeURIComponent(url)}`, {
        headers: { 'User-Agent': 'WaPlus/1.0' }
      });
      if (!r.ok) throw new Error(`API HTTP ${r.status}`);

      const d = await r.json();
      const mediaUrl = d.url || d.data?.url || d.result?.url || d.downloadUrl;
      if (!mediaUrl) throw new Error('API returned no media URL');

      const m = await fetch(mediaUrl);
      if (!m.ok) throw new Error(`Media HTTP ${m.status}`);

      const b = Buffer.from(await m.arrayBuffer());
      const max = Number(process.env.MAX_MEDIA_BYTES || 15000000);
      if (b.length > max) throw new Error(`Too large ${(b.length/1024/1024).toFixed(1)}MB > ${max/1024/1024}MB`);

      const type = (d.mimetype || m.headers.get('content-type') || 'video/mp4').toLowerCase();
      const title = d.title || d.data?.title || 'Downloaded by WaPlus';

      let payload;
      if (type.startsWith('audio/') || d.type === 'audio') {
        payload = { audio: b, mimetype: type, ptt: false };
      } else if (type.startsWith('image/')) {
        payload = { image: b, caption: `*› ${title}*\n_› ${url}_` };
      } else {
        payload = { video: b, mimetype: type, caption: `*┌─ ✦ MEDIA ✦*\n├─ › Title : \`${title.slice(0, 60)}\`\n└─ _› ${url}_` };
      }

      await sock.sendMessage(message.chat, payload, { quoted: message });
      await sock.sendMessage(message.chat, { react: { text: '✓', key: message.key } }).catch(()=>{});

    } catch (e) {
      return reply(`*┌─ ✦ ERROR ✦*\n└─ _Download failed: ${e.message}_`);
    }
  },
};