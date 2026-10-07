/**
 * ╭──────────────────────────────────────────────╮
 *   WAPLUS · CONFIG
 *   Every setting lives here. Values come from
 *   your .env file first, then fall back to the
 *   defaults on the right.
 * ╰──────────────────────────────────────────────╯
 */
require('dotenv').config();

const list = (value) => String(value || '').split(',').map((v) => v.replace(/\D/g, '')).filter(Boolean);
const bool = (value, fallback) => (value === undefined || value === '' ? fallback : value === 'true');

module.exports = {
  // ── Identity ───────────────────────────────────
  botName: process.env.BOT_NAME || 'WaPlus',
  ownerName: process.env.OWNER_NAME || 'Musteqeem',
  ownerNumbers: list(process.env.OWNER_NUMBER || '2348000000000'),
  prefix: process.env.PREFIX || '.',
  version: require('./package.json').version,

  // ── Session / pairing ──────────────────────────
  sessionDir: process.env.SESSION_DIR || 'session',
  pairingNumber: String(process.env.PAIRING_NUMBER || '').replace(/\D/g, ''),
  // Must be exactly 8 letters/numbers. Leave empty for a random code.
  pairingCode: process.env.PAIRING_CODE ?? 'XADONITE',

  // ── Behaviour ──────────────────────────────────
  mode: process.env.MODE || 'public', // public | private
  autoRead: bool(process.env.AUTO_READ, false),
  cooldownMs: Number(process.env.COOLDOWN_MS || 2500),

  // ── Premium look (all can be toggled live with .premium) ──
  premium: {
    aiBadge: bool(process.env.AI_BADGE, true), // AI label on bot messages (private chats)
    verified: bool(process.env.VERIFIED_BADGE, true), // verified tick quote on replies
    metaLabel: bool(process.env.META_LABEL, false), // secured-by-Meta business label
    channel: bool(process.env.CHANNEL_FORWARD, true), // "Forwarded from channel" header
  },
  channel: {
    jid: process.env.CHANNEL_JID || '', // e.g. 120363000000000000@newsletter
    name: process.env.CHANNEL_NAME || 'WaPlus Updates',
  },
  links: {
    website: process.env.WEBSITE_URL || 'https://github.com/musteqeem/baileys',
  },

  // ── AI (.ai command) ───────────────────────────
  ai: {
    provider: process.env.AI_PROVIDER || 'auto', // auto | groq | gemini | openai
    system:
      process.env.AI_SYSTEM_PROMPT ||
      'You are WaPlus AI, a premium WhatsApp assistant. Reply clearly and briefly. Never use emojis.',
  },

  // ── Web panel ──────────────────────────────────
  port: Number(process.env.PORT || 3000),
};
