const fs = require('fs');
const path = require('path');
const { addCommand, clearRegistry, getUnique } = require('./xdnCmd');

const root = path.join(__dirname, '../Commands');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(full));
    else if (ent.name.endsWith('.js')) out.push(full);
  }
  return out;
}

function loadCommands() {
  clearRegistry();
  let total = 0, failed = 0, dup = 0;
  const errors = [];

  const files = walk(root);
  if (!files.length) console.warn(`[PLUGIN] No commands found in ${root}`);

  for (const file of files) {
    try {
      delete require.cache[require.resolve(file)];
      const exported = require(file);
      const list = Array.isArray(exported)? exported : [exported];

      for (const cmd of list) {
        if (!cmd?.name || typeof cmd.execute!== 'function') {
          failed++;
          errors.push(`${path.relative(root, file)}: missing name/execute`);
          continue;
        }
        // › meta
        cmd.category ||= path.basename(path.dirname(file)).replace(/^\w/, c=>c.toUpperCase());
        cmd.file = path.relative(root, file);
        cmd.desc ||= '';
        cmd.usage ||= `${cmd.name}`;

        if (addCommand(cmd)) total++;
        else {
          dup++;
          console.warn(`[PLUGIN] Duplicate: ${cmd.name} @ ${cmd.file}`);
        }
      }
    } catch (e) {
      failed++;
      errors.push(`${path.relative(root, file)}: ${e.message}`);
      console.error(`[PLUGIN] ${path.relative(root, file)}: ${e.stack || e}`);
    }
  }

  console.log(`[PLUGIN] Loaded ${total} | dup ${dup} | failed ${failed}`);
  if (errors.length) console.log(`[PLUGIN] ERR:\n - ${errors.join('\n - ')}`);

  return { total, failed, dup, loaded: getUnique() };
}

function reloadCommands() { return loadCommands(); }

module.exports = { loadCommands, reloadCommands, root };