/**
 * ╭──────────────────────────────────────────────╮
 *   WAPLUS · PREMIUM LAYER
 *   Adds the "premium bot" look to every message
 *   automatically, the same tricks used by
 *   Cody AI, Crysnova AI and Xadon AI:
 *
 *   ◈ AI badge          → content.ai = true (private chats only)
 *   ◈ Verified quote    → reply quotes a verified contact card
 *   ◈ Channel forward   → "Forwarded from <your channel>" header
 *   ◈ Meta label        → secured-by-Meta business label
 *   ◈ Ad card           → big preview card with title + link
 *   ◈ Native buttons    → quick reply / url / copy / list buttons
 *
 *   Toggle any of them live with: .premium <name> on|off
 * ╰──────────────────────────────────────────────╯
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const config = require('../../config');
const db = require('./database');

const BANNER_PATH = path.resolve(__dirname, '../../assets/banner.png');
const assets = { banner: null, thumb: null };

async function loadAssets() {
  if (!fs.existsSync(BANNER_PATH)) return assets;
  assets.banner = await sharp(BANNER_PATH).jpeg({ quality: 88 }).toBuffer();
  assets.thumb = await sharp(BANNER_PATH).resize(320, 180, { fit: 'cover' }).jpeg({ quality: 70 }).toBuffer();
  return assets;
}

const settings = () => ({ ...config.premium, ...db.get('premium', {}) });

const isPrivate = (jid = '') => jid.endsWith('@s.whatsapp.net') || jid.endsWith('@lid');

/** Quoted contact from the verified Meta AI number, shows a blue tick on top of the reply. */
function verifiedQuote(name = config.botName) {
  return {
    key: { remoteJid: 'status@broadcast', participant: '0@s.whatsapp.net', fromMe: false, id: `WAPLUS${Date.now()}` },
    message: {
      contactMessage: {
        displayName: name,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${name};;;\nFN:${name}\nORG:${name} Verified\nitem1.TEL;waid=13135550002:+1 313 555 0002\nitem1.X-ABLabel:Mobile\nEND:VCARD`,
      },
    },
  };
}

function channelContext() {
  if (!settings().channel || !config.channel.jid) return {};
  return {
    isForwarded: true,
    forwardingScore: 1,
    forwardedNewsletterMessageInfo: {
      newsletterJid: config.channel.jid,
      newsletterName: config.channel.name,
      serverMessageId: 143,
    },
  };
}

/** Big link preview card. Spread it into contextInfo. */
function adCard({ title = config.botName, body = 'Premium WhatsApp Engine', url = config.links.website, large = true } = {}) {
  return {
    externalAdReply: {
      title,
      body,
      mediaType: 1,
      thumbnail: large ? assets.banner || undefined : assets.thumb || undefined,
      sourceUrl: url,
      renderLargerThumbnail: large,
      showAdAttribution: false,
    },
  };
}

const SKIP = ['react', 'delete', 'edit', 'pin', 'protocolMessage', 'disappearingMessagesInChat'];

function decorate(jid, content, options) {
  const s = settings();
  const next = { ...content };
  const opts = { ...options };

  if (s.aiBadge && isPrivate(jid) && next.ai === undefined) next.ai = true;
  if (s.metaLabel && next.secureMetaServiceLabel === undefined) next.secureMetaServiceLabel = true;
  if (!next.poll && !next.sticker && !next.contacts) next.contextInfo = { ...channelContext(), ...next.contextInfo };
  if (opts.quoted === 'verified') {
    if (s.verified) opts.quoted = verifiedQuote();
    else delete opts.quoted;
  }
  return { content: next, options: opts };
}

/** Wraps sock.sendMessage so every message gets the premium look automatically. */
function install(sock) {
  const original = sock.sendMessage.bind(sock);
  sock.sendRaw = original;
  sock.sendMessage = async (jid, content = {}, options = {}) => {
    if (SKIP.some((k) => k in content)) return original(jid, content, options);
    const enhanced = decorate(jid, content, options);
    try {
      return await original(jid, enhanced.content, enhanced.options);
    } catch (err) {
      // If WhatsApp rejects a premium field, send the plain message instead.
      const plainOptions = { ...options };
      if (plainOptions.quoted === 'verified') delete plainOptions.quoted;
      return original(jid, content, plainOptions);
    }
  };

  /**
   * Native flow buttons. Each button is ONE of:
   *   { text, id }        quick reply (runs a command, e.g. id: '.ping')
   *   { text, url }       open link
   *   { text, copy }      copy text
   *   { text, sections }  list menu
   */
  sock.sendButtons = async (jid, { text, footer, image, buttons = [], title, contextInfo }, options = {}) => {
    const body = image ? { image, caption: text, title } : { text };
    try {
      return await sock.sendMessage(jid, { ...body, footer, nativeFlow: buttons, contextInfo }, options);
    } catch {
      const hints = buttons.filter((b) => b.id).map((b) => `  ▸ ${b.id}  ${b.text}`).join('\n');
      return sock.sendMessage(jid, { ...(image ? { image, caption: `${text}\n\n${hints}` } : { text: `${text}\n\n${hints}` }), contextInfo }, options);
    }
  };
  return sock;
}

module.exports = { install, loadAssets, assets, verifiedQuote, adCard, channelContext, settings };
