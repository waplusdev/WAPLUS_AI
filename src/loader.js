/**
 * Loads every .js file inside src/commands (and its sub folders).
 * Drop a new file in that folder and restart: it becomes a command.
 */
const fs = require('fs');
const path = require('path');

const DIR = path.resolve(__dirname, 'commands');
const commands = new Map();
const aliases = new Map();

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith('.js') ? [full] : [];
  });
}

function load() {
  commands.clear();
  aliases.clear();
  for (const file of walk(DIR)) {
    delete require.cache[require.resolve(file)];
    try {
      const cmd = require(file);
      if (!cmd?.name || typeof cmd.run !== 'function') {
        console.warn(`  skip  ${path.relative(DIR, file)} (needs "name" and "run")`);
        continue;
      }
      cmd.category ||= path.basename(path.dirname(file)) === 'commands' ? 'general' : path.basename(path.dirname(file));
      commands.set(cmd.name, cmd);
      for (const alias of cmd.alias || []) aliases.set(alias, cmd.name);
    } catch (err) {
      console.error(`  fail  ${path.relative(DIR, file)}: ${err.message}`);
    }
  }
  return commands;
}

const find = (name) => commands.get(name) || commands.get(aliases.get(name));

function byCategory() {
  const groups = {};
  for (const cmd of commands.values()) (groups[cmd.category] ||= []).push(cmd);
  return groups;
}

module.exports = { load, find, byCategory, commands };
