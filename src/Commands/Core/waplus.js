const crypto = require('crypto');
const { generateWAMessageFromContent } = require('@musteqeem/baileys');

/**
 * Gen4 FOA Html Primitive - WaPlus Edition
 */
async function sendHtmlPrimitive(sock, jid, html) {
    const msg = generateWAMessageFromContent(jid, {
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    messageType: 1,
                    unifiedResponse: {
                        data: Buffer.from(
                            JSON.stringify({
                                __typename: 'GenAIUnifiedResponse',
                                response_id: crypto.randomUUID(),
                                sections: [
                                    {
                                        __typename: 'GenAIUnifiedResponseSection',
                                        view_model: {
                                            __typename: 'GenAISingleLayoutViewModel',
                                            primitive: {
                                                __typename: 'FOAHtmlPrimitiveDemoDONOTUSE',
                                                trusted_sources: [],
                                                payload: html.trim()
                                            }
                                        }
                                    }
                                ]
                            })
                        ).toString('base64')
                    },
                    contextInfo: { isForwarded: true, forwardOrigin: 4 }
                }
            }
        }
    }, {});
    return sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
}

function waplusHtml() {
return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
*{box-sizing:border-box}html,body{margin:0;background:transparent;font-family:Arial Black,Arial,sans-serif;overscroll-behavior:none}
body{padding:8px;background:radial-gradient(circle at 50% 0%,#00ffcc22,#050505 70%)}
.card{position:relative;padding:16px;border:2px solid #00ffcc;border-radius:22px;background:linear-gradient(145deg,#080f0f,#0a1e1a 50%,#050505);box-shadow:inset 0 0 0 2px #0a3d36,0 0 30px #00ffcc44;overflow:hidden}
.card:before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:conic-gradient(from 0deg,#00ffcc00,#00ffcc33,#00ffcc00);animation:rotate 4s linear infinite;pointer-events:none}
@keyframes rotate{to{transform:rotate(360deg)}}
.inner{position:relative;z-index:2}
.badge{display:inline-block;padding:4px 12px;border-radius:20px;background:#00ffcc;color:#000;font:900 10px monospace;letter-spacing:1px;animation:pulse 1.5s infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 #00ffcc88}50%{box-shadow:0 0 0 8px #00ffcc00}}
.title{margin:10px 0 2px;text-align:center;color:#fff;font:900 32px Arial Black;text-shadow:0 0 20px #00ffcc,0 0 40px #00ffcc44;letter-spacing:2px}
.title span{color:#00ffcc}
.typingWrap{margin:8px auto;height:28px;display:grid;place-items:center}
.typing{font:700 14px 'Fira Code',monospace;color:#00ffcc;white-space:nowrap;overflow:hidden;border-right:3px solid #00ffcc;width:0;animation:typing 3s steps(30,end) forwards,blink .7s infinite,changeText 12s infinite}
@keyframes typing{from{width:0}to{width:100%}}
@keyframes blink{50%{border-color:transparent}}
@keyframes changeText{
 0%,25%{content:"Built By Musteqeem"}
 26%,50%{content:"Developer of XADON AI"}
 51%,75%{content:"WaPlus - Free Bot Starter"}
 76%,100%{content:"Build Features. Drop Plugins."}
}
.desc{text-align:center;color:#9be7d8;font:11px monospace;margin:4px 0 12px;opacity:.9}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}
.box{padding:10px;border:1px solid #1a4a42;border-radius:12px;background:#0a1a18;color:#b9fff2;font:11px monospace;text-align:center}
.box b{color:#00ffcc;display:block;font-size:13px;margin-bottom:2px}
.starBtn{display:block;margin:14px auto 6px;padding:12px 20px;text-align:center;border-radius:12px;background:linear-gradient(90deg,#00ffcc,#00c8a0);color:#000;font:900 13px Arial Black;text-decoration:none;animation:starPulse 1.2s infinite;box-shadow:0 0 20px #00ffcc88}
@keyframes starPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05);box-shadow:0 0 35px #00ffcc}}
.footer{text-align:center;margin-top:10px;color:#5a7a75;font:9px monospace}
.typingAnim{width:22ch;animation:typing 2.5s steps(22) infinite alternate}
@keyframes typingAnim{from{width:0}to{width:22ch}}
.stars{position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;background-image:radial-gradient(#00ffcc22 1px,transparent 1px);background-size:20px 20px;animation:moveStars 10s linear infinite}
@keyframes moveStars{from{transform:translateY(0)}to{transform:translateY(20px)}}
</style></head><body><div class="card"><div class="stars"></div><div class="inner">
<div style="text-align:center"><span class="badge">✦ WAPLUS FREE EDITION ✦</span></div>
<div class="title">WAPLUS <span>✦</span></div>
<div class="typingWrap"><div class="typing">Built By Musteqeem — Developer of XADON AI</div></div>
<div class="desc">Free WhatsApp Bot Starter • Built on @musteqeem/baileys<br>Clean • Editable • Plugin Powered</div>

<div class="grid">
<div class="box"><b>🔌 Plugins</b>Drop-in Loader</div>
<div class="box"><b>⚡ Fast</b>No Boilerplate</div>
<div class="box"><b>🛡️ Secure</b>Owner Controls</div>
<div class="box"><b>🧠 AI Ready</b>Gemini / OpenAI</div>
</div>

<a class="starBtn" href="https://github.com/musteqeem/WaPlus">⭐ STAR THE REPO — IT MOTIVATES ME ⭐</a>

<div class="footer">
Made with ❤️ by Musteqeem AKA Future Scientist<br>
Developer of XADON AI • WaPlus v2.0.0<br>
<span style="color:#00ffcc;animation:blink 1s infinite">_ Please star & fork to support future updates</span>
</div>
</div></div></body></html>`;
}

module.exports = {
    name: 'waplus',
    alias: ['aboutbot','musteqeem','xadon','banner'],
    desc: 'Show WaPlus rich banner by Musteqeem',
    category: 'Core',
    execute: async (sock, m) => {
        try {
            await sendHtmlPrimitive(sock, m.chat, waplusHtml());
        } catch (e) {
            console.error(e);
            await sock.sendMessage(m.chat,{text:'✦ WaPlus — Built By Musteqeem\nDeveloper of XADON AI\n\n⭐ Please star the repo: github.com/musteqeem/WaPlus'});
        }
    }
};