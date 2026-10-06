const bar = '━━━━━━━━━━━━━━━━━━━━';
const bold = t => `*${t}*`;
const mono = t => `\`\`\`${t}\`\`\``;
const line = (icon, label, value) => `│ ${icon} ${label} : ${bold(value)}`;
const thin = '├' + bar + '┤';

const card = (title, lines = [], footer = '') => [
  `╭${bar}╮`,
  `│ ✦ *${title.toUpperCase()}*`,
  thin,
...lines.map(l => l.startsWith('│') || l.startsWith('*') || l.startsWith('╰') || l.startsWith('╭') || l.startsWith('├') ||!l? l : `│ ${l}`),
...(footer? [thin, `│ _${footer}_`] : []),
  `╰${bar}╯`
].filter(Boolean).join('\n');

const success = (title, text = '') => card(`✅ ${title}`, text? (Array.isArray(text)? text : [text]) : [], 'WaPlus • OK • Built By Musteqeem');
const error = (title, text = '') => card(`❌ ${title}`, text? (Array.isArray(text)? text : [text]) : [], 'Try again • XADON AI');
const info = (title, text = '') => card(`ℹ️ ${title}`, text? (Array.isArray(text)? text : [text]) : [], 'WaPlus • Developer: Musteqeem');
const warn = (title, text = '') => card(`⚠️ ${title}`, text? (Array.isArray(text)? text : [text]) : [], 'WaPlus');
const box = (title, obj = {}) => {
  const lines = Object.entries(obj).map(([k, v]) => line('›', k, v));
  return card(title, lines, 'Built By Musteqeem');
};

const menu = (title, groups, prefix = '.') => {
  const lines = []; let total = 0;
  for (const [category, commands] of Object.entries(groups)) {
    lines.push(`*┌─ ${category.toUpperCase()}*`);
    for (const c of commands) { total++; const desc = c.desc? `— ${c.desc}` : ''; lines.push(`│ ${prefix}${c.name} ${desc}`.trim()); }
    lines.push(`└─`); lines.push('');
  }
  lines.pop();
  return card(title, lines, `${total} cmds • prefix: ${prefix} • Built By Musteqeem • Star repo ⭐`);
};

// ==================== GEN4 RICH HTML INTEGRATION ====================
const crypto = require('crypto');
const { generateWAMessageFromContent } = require('@musteqeem/baileys');

async function sendHtmlPrimitive(sock, jid, html) {
    const msg = generateWAMessageFromContent(jid, {
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    messageType: 1,
                    unifiedResponse: {
                        data: Buffer.from(JSON.stringify({
                            __typename: 'GenAIUnifiedResponse', response_id: crypto.randomUUID(),
                            sections: [{ __typename: 'GenAIUnifiedResponseSection', view_model: { __typename: 'GenAISingleLayoutViewModel', primitive: { __typename: 'FOAHtmlPrimitiveDemoDONOTUSE', trusted_sources: [], payload: html.trim() } } }]
                        })).toString('base64')
                    },
                    contextInfo: { isForwarded: true, forwardOrigin: 4 }
                }
            }
        }
    }, {});
    return sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
}

// This converts your card() data to rich HTML but keeps same style
function cardHtml(title, lines = [], footer = '') {
return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
*{box-sizing:border-box}body{margin:0;padding:8px;background:radial-gradient(circle at 50% 0%,#00ffcc18,#050505 70%);font-family:monospace}
.card{border:1.8px solid #00ffcc;border-radius:16px;background:linear-gradient(145deg,#0a1e1e,#050a0a);padding:14px;color:#d6fff6;box-shadow:0 0 20px #00ffcc33}
.h{font:900 13px Arial Black;color:#00ffcc;letter-spacing:1px;margin-bottom:8px;text-align:center;text-shadow:0 0 10px #00ffcc}
.line{padding:6px 8px;border-bottom:1px solid #113a35;font-size:11.5px;color:#b9fff1}
.line b{color:#fff}
.footer{margin-top:10px;padding-top:8px;border-top:1px dashed #00ffcc55;color:#6aa99e;font-size:9px;text-align:center}
.badge{display:inline-block;padding:2px 8px;border-radius:20px;background:#00ffcc;color:#000;font:900 9px monospace;margin-bottom:6px}
.typing{color:#00ffcc;font-size:10px;text-align:center;white-space:nowrap;overflow:hidden;border-right:2px solid #00ffcc;width:0;animation:typing 2s steps(20) forwards,blink.6s infinite}
@keyframes typing{to{width:100%}}@keyframes blink{50%{border-color:transparent}}
</style></head><body><div class="card">
<div style="text-align:center"><span class="badge">✦ Built By Musteqeem • XADON AI ✦</span></div>
<div class="h">✦ ${title.toUpperCase()} ✦</div>
<div style="text-align:center;margin-bottom:8px"><div class="typing">Developer of XADON AI — WaPlus</div></div>
${lines.map(l=>`<div class="line">${l.replace(/\*/g,'').replace(/`/g,'').replace(/│/g,'').trim()}</div>`).join('')}
${footer?`<div class="footer">${footer} • ⭐ Please star the repo</div>`:''}
</div></body></html>`;
}

function successHtml(title, text=[]) { return cardHtml(`✅ ${title}`, Array.isArray(text)?text:[text], 'WaPlus • OK'); }
function errorHtml(title, text=[]) { return cardHtml(`❌ ${title}`, Array.isArray(text)?text:[text], 'Try again'); }

module.exports = {
  card, success, error, info, warn, menu, box, line, bold, mono, bar,
  // rich html
  sendHtmlPrimitive, cardHtml, successHtml, errorHtml
};