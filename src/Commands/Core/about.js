const { card } = require('../../core/ui');

module.exports = {
  name: 'about',
  desc: 'Show WaPlus framework info',
  category: 'Core',

  execute: async (sock, message, { reply, config }) => {
    const title = config?.branding?.title || 'WaPlus';
    const version = config?.branding?.version || '1.0.0';
    const engine = config?.branding?.poweredBy || 'Baileys';

    return reply(
      card(
        `✦ ${title.toUpperCase()} ✦`,
        [
          `› Version : \`${version}\``,
          `› Engine  : \`${engine}\``,
          `› Plugins : _auto-loaded_`,
          `› AI      : _Gemini / OpenAI_`,
          `› Database: _SQLite + JSON_`,
          `› Mode    : \`${config?.status?.public ? 'Public' : 'Private'}\``,
        ],
        `_Built for developers who build, not debug boilerplate_`
      )
    );
  },
};