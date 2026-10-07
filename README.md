# WaPlus Premium — WhatsApp Starter Bot

A clean, beginner-friendly WhatsApp bot built on **[@musteqeem/baileys](https://www.npmjs.com/package/@musteqeem/baileys)**.
15 commands, premium Unicode UI (no emojis), AI badge, verified tick, channel-forward header, buttons and a web pairing panel.

---

## 1. Quick start

```bash
npm install
cp .env.example .env      # then edit OWNER_NUMBER and PAIRING_NUMBER
npm start
```

1. Open WhatsApp on your phone → **Linked devices → Link with phone number**
2. Type the pairing code shown in the terminal (or open `http://localhost:3000` and pair from the panel)
3. Send `.menu` to the bot

Preview every command **without logging in**:

```bash
npm run check
```

---

## 2. Commands (15)

| Category | Command | What it does |
|---|---|---|
| General | `.menu` | Full command list with buttons |
| General | `.ping` | Speed test with a signal bar |
| General | `.alive` | Status card with banner and buttons |
| General | `.runtime` | Uptime, RAM, heap, CPU report |
| General | `.owner` | Sends the owner contact card |
| AI | `.ai <question>` | Chat with Groq / Gemini / OpenAI (reply to a message to ask about it) |
| Tools | `.sticker` | Image to sticker (reply or caption) |
| Tools | `.vv` | Re-open a view-once photo / video / audio |
| Tools | `.fancy <text>` | 8 Unicode font styles |
| Tools | `.getpp` | Profile picture of you, a mention, or a reply |
| Group | `.groupinfo` | Name, members, admins, description |
| Group | `.tagall <msg>` | Mention every member |
| Group | `.kick @user` | Remove a member (admin only) |
| Owner | `.premium` | Toggle AI badge / verified / Meta label / channel live |
| Owner | `.settings` | Change prefix and public / private mode |

---

## 3. Premium features (from the fork)

| Feature | Where | Toggle |
|---|---|---|
| **AI badge** (`ai: true`) — the "AI" label next to the bot's messages, like Cody AI / Crysnova | `src/lib/premium.js` | `.premium ai` |
| **Verified tick quote** — replies quote a WhatsApp-verified contact | `verifiedQuote()` | `.premium verified` |
| **Secured by Meta label** (`secureMetaServiceLabel`) | `decorate()` | `.premium meta` |
| **Forwarded from channel** header with your newsletter | `channelContext()` | `.premium channel` |
| **Native flow buttons** — quick reply, URL, copy, list | `sock.sendButtons()` | — |
| **Ad-reply banner card** | `adCard()` | — |

All of these are applied **automatically** to every `sock.sendMessage` — you never need to add them by hand. If WhatsApp rejects one, the message is resent plainly.

---

## 4. Project structure

```
config.js             all settings (reads .env)
index.js              starts everything
src/
  connection.js       login, pairing code, auto-reconnect
  handler.js          message → command → permission checks → run
  loader.js           auto-loads every file in src/commands
  panel.js            web panel + /api/status + /api/pair
  lib/
    ui.js             premium boxes, cards, notices, bars
    fonts.js          bold, serif, mono, small caps, italic...
    premium.js        AI badge, verified, channel, buttons
    serialize.js      turns raw messages into an easy `m`
    database.js       tiny JSON database (database/db.json)
    ai.js             Groq / Gemini / OpenAI in one function
  commands/<category>/<name>.js
scripts/check.js      offline test of every command
```

---

## 5. Make your own command

Create `src/commands/tools/hello.js`:

```js
module.exports = {
  name: 'hello',
  aliases: ['hi'],
  category: 'tools',
  desc: 'say hello',
  // owner: true, group: true, admin: true, botAdmin: true   <- optional rules

  async run({ m, reply, ui }) {
    await reply(ui.card({
      icon: '✦',
      title: 'Hello',
      subtitle: 'my first command',
      rows: [['user', m.pushName], ['time', new Date().toLocaleTimeString()]],
    }));
  },
};
```

Restart the bot — it appears in `.menu` automatically.

### What every command receives

| Key | Meaning |
|---|---|
| `sock` | the WhatsApp socket (`sock.sendMessage`, `sock.sendButtons`) |
| `m` | the message: `m.chat`, `m.sender`, `m.body`, `m.quoted`, `m.mentions`, `m.download()` |
| `args`, `text` | words after the command / the full text |
| `reply(text)` | reply with the verified quote |
| `fail(title, text)` | premium error box |
| `ui`, `ui.fonts` | design helpers |
| `isOwner`, `isAdmin`, `isBotAdmin`, `group` | permission info |
| `target()` | mentioned / replied / typed user |
| `db` | `db.get(key, fallback)` and `db.set(key, value)` |

---

## 6. Ideas to add next

**Downloaders** — `.play`, `.ytmp4`, `.tiktok`, `.instagram`, `.fb`, `.spotify`, `.pinterest`
**AI** — `.imagine` (image generation), `.tts`, `.transcribe` voice notes, `.translate`, AI chatbot mode per chat, `.remini` photo enhance
**Group** — `.antilink`, `.welcome` / `.goodbye`, `.promote` / `.demote`, `.mute` / `.unmute`, `.hidetag`, `.antispam`, `.warn` (3 strikes), `.poll`
**Tools** — `.toimg`, `.take` (rename sticker pack), `.qr`, `.ss` (website screenshot), `.calc`, `.weather`, `.lyrics`, `.tourl`
**Owner** — `.broadcast`, `.block`, `.join`, `.leave`, `.setpp`, `.restart`, `.eval`, `.autostatus` view, `.anticall`, `.antidelete`
**Fun** — `.quote`, `.truth` / `.dare`, `.ship`, `.tictactoe`, `.trivia`, `.rank` with XP levels
**System** — MongoDB instead of JSON, multi-session, plugin hot-reload, rate limiting per group, scheduled messages

---

## 7. Environment variables

See `.env.example`. The only required ones are `OWNER_NUMBER` and (optionally) `PAIRING_NUMBER`.
For `.ai`, add **one** of `GROQ_API_KEY` (free at console.groq.com), `GEMINI_API_KEY` or `OPENAI_API_KEY`.

---

## 8. Deploy

Works on any Node 20+ host: VPS, Railway, Render, Koyeb, Pterodactyl panels, Termux.
Keep the `session/` folder — it is your login. Never share it.

MIT License
