/**
 * Turns a raw Baileys message into an easy object:
 *
 *   m.chat      chat id            m.sender    who sent it
 *   m.isGroup   true in groups     m.body      the text
 *   m.type      imageMessage ...   m.quoted    replied message (or null)
 *   await m.download()            await m.quoted.download()
 */
const { getContentType, jidNormalizedUser, downloadMediaMessage, normalizeMessageContent } = require('@musteqeem/baileys');

const MEDIA = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'];

function textOf(msg, type) {
  const content = msg?.[type];
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (type === 'interactiveResponseMessage') {
    try {
      return JSON.parse(content.nativeFlowResponseMessage?.paramsJson || '{}').id || '';
    } catch {
      return '';
    }
  }
  return (
    content.text ||
    content.caption ||
    content.selectedButtonId ||
    content.singleSelectReply?.selectedRowId ||
    content.selectedId ||
    ''
  );
}

function serialize(sock, raw) {
  const message = normalizeMessageContent(raw.message) || {};
  const type = getContentType(message) || '';
  const key = raw.key;
  const chat = key.remoteJid;
  const isGroup = chat.endsWith('@g.us');
  const sender = jidNormalizedUser(key.fromMe ? sock.user.id : isGroup ? key.participant : chat);
  const senderAlt = jidNormalizedUser(key.participantAlt || key.remoteJidAlt || '');
  const ctx = message[type]?.contextInfo || {};

  const m = {
    raw,
    key,
    id: key.id,
    chat,
    isGroup,
    fromMe: !!key.fromMe,
    sender,
    senderAlt,
    number: (senderAlt.endsWith('@s.whatsapp.net') ? senderAlt : sender).split('@')[0].split(':')[0],
    pushName: raw.pushName || 'User',
    type,
    message,
    body: textOf(message, type).trim(),
    mentions: ctx.mentionedJid || [],
    isMedia: MEDIA.includes(type),
    download: () => downloadMediaMessage(raw, 'buffer', {}),
    quoted: null,
  };

  if (ctx.quotedMessage) {
    const qMessage = normalizeMessageContent(ctx.quotedMessage);
    const qType = getContentType(qMessage) || '';
    const qRaw = { key: { remoteJid: chat, id: ctx.stanzaId, participant: ctx.participant, fromMe: false }, message: qMessage };
    m.quoted = {
      raw: qRaw,
      id: ctx.stanzaId,
      sender: jidNormalizedUser(ctx.participant || ''),
      type: qType,
      message: qMessage,
      body: textOf(qMessage, qType),
      isMedia: MEDIA.includes(qType),
      viewOnce: !!qMessage?.[qType]?.viewOnce,
      download: () => downloadMediaMessage(qRaw, 'buffer', {}),
    };
  }
  return m;
}

module.exports = { serialize };
