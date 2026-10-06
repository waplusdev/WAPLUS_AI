# WaPlus Plugin Guide

WaPlus is designed around a simple rule:

> **If it can be a plugin, make it a plugin.**

You should rarely need to edit the message handler to add a feature.

## 1. Your first plugin

Create:

```text
src/Commands/Utility/hello.js
```

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

Restart the bot or run `.reload` as the owner.

## 2. Standard plugin contract

```js
module.exports = {
  name: 'command',
  alias: ['c'],
  desc: 'Description shown in the menu',
  category: 'Utility',
  cooldown: 1000,

  execute: async (sock, message, ctx) => {
    // command logic
  }
};
```

### Metadata

- `name` — required command name.
- `alias` — optional alternate names.
- `desc` — description for `.menu` and `.plugins`.
- `category` — menu category.
- `cooldown` — optional command cooldown in milliseconds.
- `execute` — command function.

## 3. Context helpers

Depending on the handler version, common context values include:

```js
const {
  args,
  text,
  prefix,
  reply,
  isOwner,
  isGroup,
  requireOwner,
  requireGroup,
  requireAdmin,
  requireBotAdmin,
  getGroupState,
  ui,
  config
} = ctx;
```

Use the permission helper instead of duplicating admin logic.

```js
requireOwner();
```

```js
requireGroup();
await requireAdmin();
await requireBotAdmin();
```

## 4. Arguments

For:

```text
.echo hello world
```

You can use:

```js
args // ['hello', 'world']
text // 'hello world'
```

## 5. Beautiful replies

```js
await reply(
  ui.card('MY COMMAND', [
    '⚡ Fast',
    '🧩 Plugin powered',
    '🚀 WaPlus'
  ])
);
```

## 6. Message hooks

A plugin can listen to incoming messages:

```js
module.exports = {
  name: 'keyword-reply',

  async onMessage(sock, message, ctx) {
    if ((message.text || '').toLowerCase() !== 'hello bot') {
      return false;
    }

    await ctx.reply('Hello 👋');
    return true;
  }
};
```

Return `true` when the plugin has consumed the message.

## 7. Group participant events

```js
module.exports = {
  name: 'welcome',

  async onGroupParticipantsUpdate(sock, update) {
    if (update.action !== 'add') return;

    const people = (update.participants || [])
      .map(p => typeof p === 'string' ? p : p.id)
      .filter(Boolean);

    if (!people.length) return;

    await sock.sendMessage(update.id, {
      text: `Welcome ${people.map(j => '@' + j.split('@')[0]).join(', ')} 👋`,
      mentions: people
    });
  }
};
```

## 8. Per-chat settings

Use the settings helper instead of inventing a new JSON file for every plugin:

```js
const { get, set } = require('../../core/chatSettings');

set(message.chat, 'myFeature', true);

const enabled = get(
  message.chat,
  'myFeature',
  false
);
```

## 9. AI plugins

```js
const { generate } = require('../../core/ai');

const answer = await generate('Explain promises in JavaScript.');
```

Configure the provider in `.env`.

## 10. GitHub plugins

GitHub helpers are available through the core GitHub module. Keep all GitHub tokens in `.env` and protect commands with `requireOwner()`.

```js
requireOwner();
```

Never send a GitHub token back to WhatsApp.

## 11. Good plugin rules

- Keep one feature per plugin.
- Keep secrets in `.env`.
- Validate user input.
- Use permission helpers.
- Avoid unnecessary group metadata requests.
- Handle API failures gracefully.
- Keep long-running operations bounded.
- Use the existing UI helpers.
- Document unusual commands.
- Do not modify the core handler unless the feature truly belongs in the framework.

## 12. Reloading

After creating or changing a plugin:

```text
.reload
```

The command is owner-only.

## 13. Publishing plugins

You can keep plugins inside your bot, or later package a plugin separately for your own ecosystem.

The free WaPlus bot does not require a plugin marketplace or npm package to work.
