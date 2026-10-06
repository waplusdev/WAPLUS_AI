# ✦ WaPlus — Free WhatsApp Bot Starter

> **Build features. Drop plugins. Don't fight the boilerplate.**

WaPlus is a free, editable WhatsApp bot starter built on **@musteqeem/baileys**.
It is designed for developers who want a clean source-code bot they can download, understand, customize, deploy, and extend with drop-in plugins.

This repository is the **free source bot** edition of WaPlus. It is intentionally editable: you own the source structure and can change anything.

If you want the separate framework package instead, use the WaPlus npm edition:

```bash
npm install waplus
```

The npm package and this free source bot are separate distributions.

---

## ✨ What you get

- 🔐 WhatsApp pairing-code login
- 🔌 Recursive drop-in plugin loader
- 🧩 Simple `module.exports = { name, ... }` plugin pattern
- ⚡ Central message handler and command dispatcher
- 🛡️ Owner, group admin and bot-admin permission helpers
- 🎨 Reusable WhatsApp message UI
- 📋 Automatic `.menu` command registry
- ♻️ Owner-only `.reload`
- 🔗 Per-group anti-link
- 📣 Per-group anti-tag-all
- 🧯 Per-group anti-spam
- 👋 Per-group welcome messages
- 🧠 Optional AI chatbot with Gemini/OpenAI support
- 🐙 Owner-only GitHub controls
- 📝 SQLite notes
- 🗃️ Optional message logging
- 📥 Optional media downloader adapter
- 🌐 Lightweight health/dashboard server
- 🚀 Pterodactyl, VPS, Railway and local Node deployment files
- 🧰 Baileys serializer and helper library
- ♟️ Two-player `.chess` command with a Gen 4 rich HTML board
- 📚 Beginner-friendly plugin documentation

---

# 🚀 Quick Start

## Requirements

- Node.js **20+**
- npm
- A WhatsApp account for the bot
- Internet access

Check your Node version:

```bash
node -v
npm -v
```

## 1. Download the bot

Either download the ZIP or clone your repository:

```bash
git clone <YOUR_REPOSITORY_URL>
cd WaPlus
```

## 2. Install dependencies

```bash
npm install
```

## 3. Create your environment file

Linux/macOS:

```bash
cp env.example .env
```

Windows PowerShell:

```powershell
Copy-Item env.example .env
```

Open `.env` and configure at least:

```env
BOT_NAME=WaPlus
OWNER_NAME=Your Name
OWNER_NUMBER=2348012345678
PREFIX=.
REQUEST_PAIRING=true
```

Use the international phone number format for `OWNER_NUMBER`, normally without `+` or spaces.

## 4. Pair WhatsApp

```bash
node index.js pair
```

Or:

```bash
npm run pair
```

Follow the pairing-code instructions shown in the terminal.

Your WhatsApp session is stored in the configured session directory. **Never upload that directory to GitHub.**

## 5. Start the bot

```bash
npm start
```

Or:

```bash
node index.js
```

That's it. 🎉

---

# 📁 Project Structure

```text
WaPlus/
├── index.js                  # Main bot entry point
├── bot.js                    # WhatsApp connection/runtime
├── message-handler.js or ֎.js       # Incoming message bridge
├── cli.js                    # Pairing/helper CLI
│
├── src/
│   ├── Commands/             # ⭐ Drop-in plugins
│   │   ├── Core/
│   │   ├── Moderation/
│   │   ├── AI/
│   │   ├── Developer/
│   │   └── Utility/
│   │
│   ├── Plugin/               # Loader, registry and dispatcher
│   ├── core/                 # AI, GitHub, UI, permissions, settings
│   └── Database/             # SQLite storage
│
├── library/                  # Baileys serializer/helpers
├── settings/config.js        # Runtime configuration
├── Public/                   # Optional dashboard assets
├── env.example               # Environment template
├── PLUGIN_GUIDE.md           # Plugin development guide
├── package.json
├── Procfile
├── railway.json
├── render.yaml
└── README.md
```

---

# 🔌 The Plugin System

This is the most important part of WaPlus.

You do **not** need to edit the main message handler every time you create a feature.

Create a file under:

```text
src/Commands/<Category>/<plugin>.js
```

For example:

```text
src/Commands/Utility/hello.js
```

Put this inside:

```js
module.exports = {
  name: 'hello',
  alias: ['hi'],
  desc: 'Say hello',
  category: 'Utility',

  execute: async (sock, message, { text, reply }) => {
    await reply(`Hello ${text || 'developer'} 👋`);
  }
};
```

Restart the bot or run:

```text
.reload
```

Now:

```text
.hello
```

works automatically.

### Plugin contract

```js
module.exports = {
  name: 'command',
  alias: ['c'],
  desc: 'What the command does',
  category: 'Utility',
  cooldown: 1000,

  execute: async (sock, message, ctx) => {
    // command logic
  }
};
```

You can also add message/event hooks:

```js
module.exports = {
  name: 'myfeature',

  async onMessage(sock, message, ctx) {
    // Runs for incoming messages.
  },

  async onGroupParticipantsUpdate(sock, update, ctx) {
    // Runs for group participant events.
  }
};
```

Read **PLUGIN_GUIDE.md** for the complete contract and examples.

---

# 🧠 How the Message Handler Works

WaPlus keeps moderation and automation features inside plugins instead of hard-coding every feature into one giant handler.

```text
WhatsApp
   │
   ▼
Baileys
   │
   ▼
Serializer / message normalization
   │
   ▼
Message dispatcher
   │
   ├── onMessage plugins
   │      ├── Anti-link
   │      ├── Anti-spam
   │      ├── Anti-tag-all
   │      ├── Chatbot
   │      └── Message logger
   │
   └── Command parser
          │
          ▼
       Plugin registry
          │
          ▼
       execute(ctx)
```

That means **antilink, chatbot, antispam, GitHub, and future features all follow the same plugin philosophy.**

---

# 📚 Included Commands

The starter currently includes commands such as:

| Command | Purpose |
|---|---|
| `.menu` | Show available commands |
| `.ping` | Check response latency |
| `.about` | Show WaPlus information |
| `.runtime` | Show uptime and counters |
| `.owner` | Show configured owner |
| `.echo` | Echo text |
| `.groupinfo` | Group metadata |
| `.mode` | Show runtime mode |
| `.reload` | Reload plugins |
| `.plugins` | List loaded plugins |
| `.setprefix` | Change prefix at runtime |
| `.antilink` | Enable/disable anti-link |
| `.antispam` | Enable/disable anti-spam |
| `.antitagall` | Enable/disable anti-tag-all |
| `.welcome` | Enable/disable welcome messages |
| `.chatbot` | Enable/disable AI auto-chat |
| `.ask` | Ask the configured AI provider |
| `.github` | Owner-only GitHub controls |
| `.note` | Store/list/clear chat notes |
| `.messagelog` | Optional SQLite message logging |
| `.download` | Download through an authorized media API |
| `.chess` | Start and play a two-player chess game with a rich HTML board |

Run:

```text
.menu
```

to see what is actually loaded by your copy.

---

# 🛡️ Moderation

## Anti-link

Admin:

```text
.antilink on
```

Disable:

```text
.antilink off
```

Status:

```text
.antilink
```

The setting is stored per group.

## Anti-spam

```text
.antispam on
.antispam off
.antispam
```

## Anti-tag-all

```text
.antitagall on
.antitagall off
.antitagall
```

## Welcome

```text
.welcome on
.welcome off
.welcome
```

The bot must have the appropriate group permissions for moderation actions to succeed.

---

# 🧠 AI Chatbot

WaPlus supports an optional AI layer.

Gemini example:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash
```

Or OpenAI-compatible configuration:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1/chat/completions
```

Then:

```text
.ask Explain JavaScript closures
```

To enable automatic chatbot behavior:

```text
.chatbot on
```

To disable:

```text
.chatbot off
```

The default chatbot mode is conservative. Configure `CHATBOT_MODE` if you want different behavior.

**Never put API keys directly inside a plugin.** Use `.env` and keep `.env` private.

---

# 🐙 GitHub Controls

GitHub features are optional and owner-only.

Configure:

```env
GITHUB_TOKEN=your_token
GITHUB_OWNER=your_github_username
```

Then from WhatsApp:

```text
.github status
.github repos
.github issues owner/repo
.github issue owner/repo Fix login bug
.github dispatch owner/repo workflow.yml main
```

Treat your GitHub token like a password. Do not paste it into public code, screenshots, plugins, or chats.

---

# 📝 Notes

Save a note:

```text
.note add Remember to update the README
```

List notes:

```text
.note list
```

Clear notes:

```text
.note clear
```

Notes are stored locally using SQLite.

---

# 🎨 Message UI

WaPlus includes reusable UI helpers so plugins don't all have to invent their own formatting.

For example:

```js
const { card, success, error, info } = require('../../core/ui');

await reply(
  card(
    'MY COMMAND',
    [
      '⚡ Fast response',
      '🧩 Plugin powered',
      '🚀 Built with WaPlus'
    ],
    'Have a great day!'
  )
);
```

The goal is for plugins to look consistent even when written by different developers.

---

# ♟️ Gen 4 Rich HTML Chess

WaPlus includes one example of a richer plugin: `.chess`. It is deliberately kept inside a single drop-in command so new developers can study it without changing the dispatcher or adding another service.

## Play a game

Use these commands in any private chat or group. Each chat has its own game:

```text
.chess          # create a board, or show the current board
.chess join     # join the open game as Black
.chess e2e4     # move White's pawn from e2 to e4
.chess e7e8q    # promote to a queen (q, r, b, or n)
.chess resign   # resign as the current player
.chess leave    # close the game
.chess new      # reset the chat's game
.chess help     # show the command reference
```

The prefix is configurable, so replace `.` with the value of `PREFIX` when needed. The board is sent through the existing `sendHtmlPrimitive()` helper in `src/core/ui.js`; if a WhatsApp client cannot relay the rich payload, the plugin automatically falls back to a readable text board.

The chess plugin includes legal move validation for:

- normal piece movement and captures
- check, checkmate, and stalemate
- castling on both sides
- en passant
- promotion to queen, rook, bishop, or knight
- the fifty-move draw rule

Games are isolated by chat and support exactly two players: the creator is White and the first person who uses `.chess join` is Black. Spectators can view the board, but only the player whose turn it is can move. State is intentionally in memory, so active games reset when the process restarts; no new database or dependency is required.

## How the rich HTML integration works

The base already exposes the integration point, so a plugin does not need to edit `bot.js` or the message dispatcher:

```js
const { sendHtmlPrimitive } = require('../../core/ui');

await sendHtmlPrimitive(sock, chat, '<!doctype html><html>...</html>');
```

Keep HTML generated from controlled strings, escape user-provided names, and always provide a text fallback for clients that do not support the Gen 4 payload. The chess implementation at `src/Commands/Utility/chess.js` is the reference example.

> Rich HTML is a rendered WhatsApp message, not a hosted web page. The reliable interaction channel is still the normal command parser (`.chess e2e4`), which keeps the feature compatible across devices and WhatsApp clients.

---

# ⚙️ Environment Configuration

Copy:

```text
env.example → .env
```

Important variables:

```env
BOT_NAME=WaPlus
BOT_VERSION=2.0.0
BOT_DESCRIPTION=Developer-first WhatsApp bot
BOT_FOOTER=Powered by WaPlus
OWNER_NAME=Your Name
OWNER_NUMBER=2348012345678
PREFIX=.
REQUEST_PAIRING=true
SESSION_NAME=sessions
PUBLIC_MODE=true
AUTO_READ=false
AUTO_TYPING=false
PORT=3001
COMMAND_COOLDOWN_MS=1000
MAX_MEDIA_BYTES=15000000
```

Optional:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=
GITHUB_TOKEN=
GITHUB_OWNER=
MEDIA_API_URL=
```

If a feature is not needed, leave its optional credentials empty.

---

# 🔐 Security Checklist

Before putting WaPlus online:

- [ ] Never commit `.env`
- [ ] Never commit `sessions/`
- [ ] Never expose `GITHUB_TOKEN`
- [ ] Never expose AI API keys
- [ ] Use a strong owner number configuration
- [ ] Keep the bot's WhatsApp account separate from personal accounts where possible
- [ ] Give the bot only the group permissions it actually needs
- [ ] Do not enable message logging unless you understand what data is being stored
- [ ] Do not install untrusted plugins

The included `.gitignore` is intended to help protect common secrets and runtime files, but always check it before your first Git commit.

---

# 🖥️ Pterodactyl Deployment

WaPlus works well as a worker process on Pterodactyl.

## Recommended setup

Create a Node.js server and use Node **20+**.

Upload the WaPlus source or clone your repository.

Install:

```bash
npm install
```

Create `.env` and configure your bot.

Startup command:

```bash
npm start
```

For the first pairing, you can temporarily use:

```bash
node index.js pair
```

Complete the pairing flow, then start normally with:

```bash
npm start
```

### Important

Persist your `sessions/` directory using your server's storage. If the session disappears every time the container restarts, the bot may need to pair again.

---

# ☁️ VPS Deployment

On Ubuntu/Debian, install Node.js 20+ and Git, then:

```bash
git clone <YOUR_REPOSITORY_URL>
cd WaPlus
npm install
cp env.example .env
nano .env
node index.js pair
npm start
```

For a production VPS, use a process manager such as `pm2` or a systemd service so the bot restarts after crashes/reboots.

Example with PM2:

```bash
npm install -g pm2
pm2 start index.js --name waplus
pm2 save
pm2 startup
```

Check logs:

```bash
pm2 logs waplus
```

---

# 🚂 Railway / Render / Other Node Hosts

The repository includes deployment configuration files as starting points.

The general commands are:

```bash
npm install
npm start
```

Make sure environment variables are configured in the hosting provider's dashboard.

For WhatsApp session persistence, verify that the provider gives you durable storage. Ephemeral storage can cause repeated pairing.

---

# 🧪 Check Your Installation

Run:

```bash
npm run check
```

This checks JavaScript syntax throughout the project.

You can also inspect your installed commands with:

```text
.menu
```

and:

```text
.plugins
```

---

# 🧑‍💻 Development Workflow

The recommended workflow is:

```text
1. Fork / copy WaPlus
       ↓
2. Configure .env
       ↓
3. Pair WhatsApp
       ↓
4. Create plugin
       ↓
5. Test command
       ↓
6. Run .reload
       ↓
7. Commit plugin
       ↓
8. Deploy
```

Do not edit `message-handler.js` just to add a normal command.

Create a plugin instead.

---

# 🧩 Example: A Better Plugin

```js
module.exports = {
  name: 'userinfo',
  alias: ['whoami'],
  desc: 'Show information about the current sender',
  category: 'Utility',
  cooldown: 1000,

  execute: async (sock, message, {
    reply,
    ui,
    isGroup,
    config
  }) => {
    await reply(
      ui.card('USER INFO', [
        `👤 Sender: @${String(message.sender || '').split('@')[0]}`,
        `💬 Chat: ${isGroup ? 'Group' : 'Private'}`,
        `🤖 Bot: ${config.branding.title}`
      ])
    );
  }
};
```

Drop it into:

```text
src/Commands/Utility/userinfo.js
```

Then:

```text
.reload
```

Now:

```text
.userinfo
```

works.

---

# 📦 Can this free bot be published to npm?

**This edition is not the npm framework package.**

The free bot is intentionally a complete editable application. It is meant to be downloaded, cloned, customized, and deployed.

For the separate npm framework, use:

```bash
npm install waplus
```

Keep the two projects/distributions conceptually separate:

```text
WaPlus Free Bot
├── complete WhatsApp bot source
├── beginner friendly
├── edit everything
├── Pterodactyl/VPS/local
└── drop-in plugins

WaPlus npm
├── framework/API
├── npm install waplus
├── reusable runtime
├── library imports
└── developer ecosystem
```

---

# 🤝 Contributing

Want to add a feature?

The easiest contribution is a plugin.

1. Create a plugin under `src/Commands/`.
2. Follow the plugin contract.
3. Keep secrets out of source code.
4. Test with `npm run check`.
5. Document commands that users need to know.
6. Open a pull request.

Please keep the core small. If a feature can be a plugin, make it a plugin.

---

# ❤️ Philosophy

WaPlus is built around one idea:

> **Developers should spend their time building features, not rebuilding the same WhatsApp bot architecture.**

The free version gives you the source.

You can change it.
Break it.
Learn from it.
Rewrite it.
Build something bigger from it.

And if you want the framework experience:

```bash
npm install waplus
```

---

# 📜 License

MIT — see `LICENSE`.

---

# 🙏 Credits

- **Musteqeem AKA Future Scientist** — Developer of WaPlus 
- **WaPlus contributors** — framework and starter architecture
- **@musteqeem/baileys** — WhatsApp Web protocol implementation used by this project
- Baileys ecosystem contributors and the open-source Node.js community

Use WhatsApp automation responsibly and follow the applicable WhatsApp terms and policies.

**WaPlus — drop plugins, build faster. ✦**
