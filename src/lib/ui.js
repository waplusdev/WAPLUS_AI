/**
 * ╭──────────────────────────────────────────────╮
 *   WAPLUS · UI KIT
 *   Premium text layouts built only from unicode
 *   symbols (no emojis). Use them in any command:
 *
 *   ui.card({ title, subtitle, rows, body })
 *   ui.notice('success' | 'error' | 'warn' | 'info', title, text)
 *   ui.bar(75)          → ▰▰▰▰▰▰▰▰▰▱▱▱  75%
 *   ui.section(name, lines)
 * ╰──────────────────────────────────────────────╯
 */
const fonts = require('./fonts');
const config = require('../../config');

const LINE = '─'.repeat(22);
const DOTS = '┄'.repeat(24);

const footer = () => `  ⌬ ${fonts.smallCaps(config.botName)} · ${fonts.smallCaps('premium')} · ᴠ${config.version}`;

const row = (label, value) => `│ ◈ ${fonts.smallCaps(label)} ⟶ ${value}`;

function card({ title, subtitle, rows = [], body, icon = '⟢' } = {}) {
  const out = [`╭${LINE}╮`, `│ ${icon} ${fonts.bold(String(title).toUpperCase())}`];
  if (subtitle) out.push(`│   ${fonts.smallCaps(subtitle)}`);
  if (rows.length || body) out.push(`├${LINE}┤`);
  for (const [label, value] of rows) out.push(row(label, value));
  if (body) {
    if (rows.length) out.push('│');
    for (const text of String(body).split('\n')) out.push(`│ ${text}`);
  }
  out.push(`╰${LINE}╯`, footer());
  return out.join('\n');
}

const NOTICE = {
  success: { mark: '✓', word: 'success' },
  error: { mark: '✗', word: 'error' },
  warn: { mark: '!', word: 'notice' },
  info: { mark: 'i', word: 'info' },
};

function notice(type, title, text = '') {
  const { mark, word } = NOTICE[type] || NOTICE.info;
  return [
    `⟦ ${mark} ⟧ ${fonts.bold(String(title).toUpperCase())}`,
    `${fonts.smallCaps(word)} ${DOTS.slice(0, 16)}`,
    text ? `\n${text}` : '',
    `\n${footer()}`,
  ].join('\n').replace(/\n{3,}/g, '\n\n');
}

function bar(percent, size = 12) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  const filled = Math.round((p / 100) * size);
  return `${'▰'.repeat(filled)}${'▱'.repeat(size - filled)}  ${fonts.bold(`${p}%`)}`;
}

function section(name, lines = []) {
  return [`┏━━ ⫸ ${fonts.bold(String(name).toUpperCase())}`, ...lines.map((l) => `┃ ${l}`), '┗━━━━━━━━━━━━'].join('\n');
}

function duration(ms) {
  const s = Math.floor(ms / 1000);
  const parts = [
    [Math.floor(s / 86400), 'd'],
    [Math.floor((s % 86400) / 3600), 'h'],
    [Math.floor((s % 3600) / 60), 'm'],
    [s % 60, 's'],
  ].filter(([v], i, arr) => v > 0 || i === arr.length - 1);
  return parts.map(([v, u]) => `${v}${u}`).join(' ');
}

const bytes = (n) => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(i ? 1 : 0)} ${units[i]}`;
};

module.exports = { card, notice, bar, section, duration, bytes, footer, row, fonts, LINE, DOTS };
