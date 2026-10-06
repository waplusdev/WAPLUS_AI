const { getVar, setVar, delVar } = require('../Plugin/configManager');

function key(chat, name) {
  return `chat:${chat}:${name}`;
}

function get(chat, name, fallback = false) {
  return getVar(key(chat, name), fallback);
}

function set(chat, name, value) {
  return setVar(key(chat, name), value);
}

function del(chat, name) {
  return delVar ? delVar(key(chat, name)) : setVar(key(chat, name), null);
}

function toggle(chat, name) {
  const cur = get(chat, name, false);
  set(chat, name, !cur);
  return !cur;
}

function all(chat) {
  // › returns raw keys for this chat
  return {
    welcome: get(chat, 'welcome', false),
    antilink: get(chat, 'antilink', false),
    antispam: get(chat, 'antispam', false),
    antibadword: get(chat, 'antibadword', false),
  };
}

module.exports = { get, set, del, toggle, all, key };