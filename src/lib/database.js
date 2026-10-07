/**
 * Tiny JSON database. No setup needed.
 *
 *   db.get('prefix', '.')
 *   db.set('prefix', '!')
 *
 * Data is saved in database/data.json and survives restarts.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.resolve(__dirname, '../../database/data.json');
fs.mkdirSync(path.dirname(FILE), { recursive: true });

let data = {};
try {
  data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
} catch {
  data = {};
}

let timer = null;
function save() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const tmp = `${FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, FILE);
  }, 300);
}

module.exports = {
  get: (key, fallback) => (key in data ? data[key] : fallback),
  set: (key, value) => {
    data[key] = value;
    save();
    return value;
  },
  delete: (key) => {
    delete data[key];
    save();
  },
  all: () => ({ ...data }),
};
