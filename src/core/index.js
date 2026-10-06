const { card, success, error, info, menu, line, box, bold } = require('./ui');
const { groupState, normalize, guard, isAdmin, isOwner, requireGroup, requireAdmin } = require('./permissions');
const { getVar, setVar, allVars, delVar } = require('../Plugin/configManager');

module.exports = {
  ui: {
    card,
    success,
    error,
    info,
    menu,
    line,
    box,
    bold,
    // › aliases for rich template
    ok: success,
    fail: error
  },
  permissions: {
    groupState,
    normalize,
    guard,
    isAdmin,
    isOwner,
    requireGroup,
    requireAdmin
  },
  runtime: {
    getVar,
    setVar,
    allVars,
    delVar,
    get: getVar,
    set: setVar,
    all: allVars,
    del: delVar
  }
};