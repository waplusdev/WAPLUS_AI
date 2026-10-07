/**
 * ╭──────────────────────────────────────────────╮
 *   WAPLUS · HANDLER
 *   Message in  →  find command  →  check rules  →  run
 * ╰──────────────────────────────────────────────╯
 */
const config = require('../config');
const db = require('./lib/database');
const ui = require('./lib/ui');
const premium = require('./lib/premium');
const { serialize } = require('./lib/serialize');
const loader = require('./loader');

const stats = { messages: 0, commands: 0, startedAt: Date.now() };
const cooldowns = new Map();
const groupCache = new Map();

async function groupMeta(sock, jid) {
  const cached = groupCache.get(jid);
  if (cached && Date.now() - cached.at < 60_000) return cached.data;
  const data = await sock.groupMetadata(jid);
  groupCache.set(jid, { data, at: Date.now() });
  return data;
}

const digits = (jid = '') => String(jid).split('@')[0].split(':')[0];

function findParticipant(meta, ids) {
  const wanted = ids.filter(Boolean).map(digits);
  return meta?.participants?.find((p) => [p.id, p.lid, p.phoneNumber, p.jid].some((id) => id && wanted.includes(digits(id))));
}

async function handle(sock, raw) {
  if (!raw?.message || raw.key.remoteJid === 'status@broadcast') return;
  stats.messages++;

  const m = serialize(sock, raw);
  if (config.autoRead) sock.readMessages([raw.key]).catch(() => {});

  const prefix = db.get('prefix', config.prefix);
  if (!m.body.startsWith(prefix)) return;

  const [name, ...args] = m.body.slice(prefix.length).trim().split(/\s+/);
  const cmd = loader.find(String(name).toLowerCase());
  if (!cmd) return;

  const botNumber = digits(sock.user?.id);
  const isOwner = m.fromMe || m.number === botNumber || config.ownerNumbers.includes(m.number);
  const reply = (text, extra = {}) =>
    sock.sendMessage(m.chat, { text, ...extra }, { quoted: premium.settings().verified ? 'verified' : raw });
  const fail = (title, text) => reply(ui.notice('error', title, text));

  if (db.get('mode', config.mode) === 'private' && !isOwner) return;
  if (cmd.owner && !isOwner) return fail('Owner only', 'This command is reserved for the bot owner.');
  if (cmd.group && !m.isGroup) return fail('Group only', 'Use this command inside a group.');

  let group = null;
  let isAdmin = false;
  let isBotAdmin = false;
  if (m.isGroup && (cmd.group || cmd.admin || cmd.botAdmin)) {
    group = await groupMeta(sock, m.chat).catch(() => null);
    isAdmin = !!findParticipant(group, [m.sender, m.senderAlt])?.admin;
    isBotAdmin = !!findParticipant(group, [sock.user?.id, sock.user?.lid])?.admin;
  }
  if (cmd.admin && !isAdmin && !isOwner) return fail('Admins only', 'Only group admins can use this command.');
  if (cmd.botAdmin && !isBotAdmin) return fail('Make me admin', 'I need admin rights to do that.');

  const last = cooldowns.get(m.sender) || 0;
  if (!isOwner && Date.now() - last < config.cooldownMs) return;
  cooldowns.set(m.sender, Date.now());

  // The person a command is about: @mention → replied user → number typed after the command.
  const target = () => {
    if (m.mentions[0]) return m.mentions[0];
    if (m.quoted?.sender) return m.quoted.sender;
    const num = args.join('').replace(/\D/g, '');
    return num.length >= 7 ? `${num}@s.whatsapp.net` : null;
  };

  stats.commands++;
  const ctx = {
    sock, m, args, text: args.join(' '), command: cmd.name, used: name.toLowerCase(), prefix,
    isOwner, isAdmin, isBotAdmin, group, target,
    reply, fail, db, ui, config, premium, stats, loader,
  };

  try {
    await sock.sendPresenceUpdate('composing', m.chat).catch(() => {});
    await cmd.run(ctx);
  } catch (err) {
    console.error(`[${cmd.name}]`, err);
    await fail('Something broke', `${ui.fonts.mono(err.message || String(err)).slice(0, 300)}`).catch(() => {});
  } finally {
    sock.sendPresenceUpdate('paused', m.chat).catch(() => {});
  }
}

module.exports = { handle, stats };
