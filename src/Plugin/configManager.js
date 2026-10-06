const fs = require('fs');
const path = require('path');

const RUNTIME_FILE = path.join(__dirname, '../../database/runtime-config.json');
let runtime = null;
let dirty = false;

function load() {
  if (runtime) return runtime;
  try {
    fs.mkdirSync(path.dirname(RUNTIME_FILE), { recursive: true });
    runtime = fs.existsSync(RUNTIME_FILE)
     ? JSON.parse(fs.readFileSync(RUNTIME_FILE, 'utf8') || '{}')
      : {};
    if (typeof runtime!== 'object' || runtime === null) runtime = {};
  } catch {
    runtime = {};
  }
  return runtime;
}

function save() {
  load();
  if (!dirty) return;
  try {
    const tmp = `${RUNTIME_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(runtime, null, 2));
    fs.renameSync(tmp, RUNTIME_FILE);
    dirty = false;
  } catch (e) {
    console.error('[configManager] save fail:', e.message);
  }
}

function coerce(value) {
  if (typeof value!== 'string') return value;
  const v = value.trim();
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null') return null;
  if (v!== '' &&!isNaN(v) && isFinite(Number(v))) return Number(v);
  try { if ((v.startsWith('{') && v.endsWith('}')) || (v.startsWith('[') && v.endsWith(']'))) return JSON.parse(v); } catch {}
  return value;
}

function setVar(key, value) {
  load();
  const k = String(key).trim();
  if (!k) throw new Error('config key required');
  runtime[k] = coerce(value);
  dirty = true;
  save();
  return runtime[k];
}

function getVar(key, fallback = null) {
  load();
  const k = String(key);
  return Object.prototype.hasOwnProperty.call(runtime, k)? runtime[k] : fallback;
}

function hasVar(key) {
  load();
  return Object.prototype.hasOwnProperty.call(runtime, String(key));
}

function delVar(key) {
  load();
  const k = String(key);
  if (!Object.hasOwn(runtime, k)) return false;
  delete runtime[k];
  dirty = true;
  save();
  return true;
}

function allVars() { return {...load() }; }

function resetAll() {
  runtime = {};
  dirty = true;
  save();
}

// › new helpers for WaPlus
function incVar(key, by = 1) {
  const cur = Number(getVar(key, 0)) || 0;
  return setVar(key, cur + Number(by || 1));
}

function pushVar(key, val) {
  const arr = getVar(key, []);
  const list = Array.isArray(arr)? arr : [];
  list.push(val);
  return setVar(key, list);
}

function flush() { save(); }

module.exports = {
  setVar, getVar, hasVar, delVar,
  allVars, resetAll,
  incVar, pushVar, flush,
  // compat
  get: getVar,
  set: setVar
};