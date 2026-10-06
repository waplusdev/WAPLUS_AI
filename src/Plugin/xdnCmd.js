const registry = new Map(); // name + alias -> cmd
const commands = new Map(); // name -> cmd

function validate(cmd) {
  return cmd &&
    typeof cmd.name === 'string' &&
    /^[a-z0-9_-]+$/i.test(cmd.name) &&
    typeof cmd.execute === 'function';
}

function addCommand(cmd, { replace = false } = {}) {
  if (!validate(cmd)) {
    console.warn(`[xdnCmd] invalid cmd: ${cmd?.name}`);
    return false;
  }
  const name = cmd.name.toLowerCase().trim();
  if (!replace && commands.has(name)) return false;

  if (replace) removeCommand(name);

  // › normalize
  cmd.name = name;
  cmd.category = cmd.category || 'General';
  cmd.desc = cmd.desc || '';
  cmd.alias = Array.isArray(cmd.alias)? cmd.alias.map(a => String(a).toLowerCase()) : [];

  commands.set(name, cmd);
  registry.set(name, cmd);

  for (const a of cmd.alias) {
    if (!a) continue;
    if (replace ||!registry.has(a)) registry.set(a, cmd);
  }
  return true;
}

function removeCommand(name) {
  const key = String(name).toLowerCase();
  const cmd = commands.get(key) || registry.get(key);
  if (!cmd) return false;
  const realName = cmd.name.toLowerCase();
  commands.delete(realName);
  for (const [k, v] of registry) if (v === cmd) registry.delete(k);
  return true;
}

function clearRegistry() { registry.clear(); commands.clear(); }

function getCommand(name) { return registry.get(String(name || '').toLowerCase()) || null; }

function getAll() { return registry; }

function getUnique() { return [...commands.values()]; }

function getByCategory() {
  const out = {};
  for (const cmd of commands.values()) {
    const cat = (cmd.category || 'General').trim();
    (out[cat] ||= []).push(cmd);
  }
  // › sort cmds A-Z
  for (const k in out) out[k].sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

function count() { return commands.size; }

function has(name) { return registry.has(String(name).toLowerCase()); }

module.exports = {
  addCommand,
  registerCommand: (cmd) => addCommand(cmd, { replace: true }),
  removeCommand,
  clearRegistry,
  getCommand,
  getAll,
  getUnique,
  getByCategory,
  count,
  has
};