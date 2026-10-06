const fs = require('fs');
const path = require('path');
const baseConfig = require('../../../settings/config');

const RUNTIME_PATH = path.resolve('./database/runtime-config.json');

function loadRuntime() {
  try {
    if (!fs.existsSync(RUNTIME_PATH)) return {};
    return JSON.parse(fs.readFileSync(RUNTIME_PATH, 'utf8') || '{}');
  } catch { return {}; }
}

function saveRuntime(data) {
  fs.mkdirSync(path.dirname(RUNTIME_PATH), { recursive: true });
  fs.writeFileSync(RUNTIME_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
  name: 'mode',
  alias: ['config', 'settings', 'public'],
  desc: 'Toggle or show bot mode',
  category: 'Core',

  execute: async (sock, message, { reply, prefix, isOwner }) => {
    const args = (message.text || '').split(' ').slice(1);
    const cmd = (args[0] || '').toLowerCase();
    const runtime = loadRuntime();
    const isPublic = runtime.public?? baseConfig.status?.public?? true;

    // Show status if no arg
    if (!cmd) {
      let text = '';
      text += `*┌─ ✦ MODE ✦*\n`;
      text += `│\n`;
      text += `├─ › Current : \`${isPublic? 'PUBLIC' : 'PRIVATE'}\`\n`;
      text += `├─ › Name : \`${baseConfig.settings?.title || 'WaPlus'}\`\n`;
      text += `├─ › Prefix : \`${prefix}\`\n`;
      text += `├─ › Version : \`${baseConfig.branding?.version || '1.0.0'}\`\n`;
      text += `│\n`;
      text += `├─ _Usage:_\n`;
      text += `│ \`${prefix}mode public\` _→ everyone_\n`;
      text += `│ \`${prefix}mode private\` _→ owner only_\n`;
      text += `│ \`${prefix}mode self\` _→ same as private_\n`;
      text += `└─ _Only owner can toggle_`;
      return reply(text.trim());
    }

    // Owner check
    if (!isOwner) {
      return reply(`_› Access denied: owner only_\n_› Current: \`${isPublic? 'PUBLIC' : 'PRIVATE'}\`_`);
    }

    let newMode;
    if (['public', 'on', 'all'].includes(cmd)) newMode = true;
    else if (['private', 'self', 'off', 'owner'].includes(cmd)) newMode = false;
    else {
      return reply(`_› Invalid: \`${cmd}\`_\n_Use:_ \`${prefix}mode public/private\``);
    }

    runtime.public = newMode;
    saveRuntime(runtime);

    // apply live
    if (sock) sock.public = newMode;
    if (global.bot) global.bot.public = newMode;

    let text = '';
    text += `*┌─ ✦ MODE UPDATED ✦*\n`;
    text += `│\n`;
    text += `├─ › New Mode : \`${newMode? 'PUBLIC' : 'PRIVATE'}\`\n`;
    text += `├─ › Info : _${newMode? 'Everyone can use commands' : 'Only owner can use commands'}_\n`;
    text += `│\n`;
    text += `└─ ✓ _Saved to runtime-config.json_`;

    return reply(text.trim());
  },
};