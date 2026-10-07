const config = {
  owner: process.env.OWNER_NUMBER || '',
  botNumber: process.env.BOT_NUMBER || '',
  session: process.env.SESSION_NAME || 'sessions',
  status: {
    public: process.env.PUBLIC_MODE !== 'false',
    requestPairingCode: process.env.REQUEST_PAIRING !== 'false',
    terminal: process.env.TERMINAL_MODE === 'true'
  },
  mode: {
    autoRead: process.env.AUTO_READ !== 'false',
    autoTyping: process.env.AUTO_TYPING === 'true',
    autoRecording: process.env.AUTO_RECORDING === 'true'
  },
  settings: {
    title: process.env.BOT_NAME || 'WaPlus',
    packname: process.env.BOT_NAME || 'WaPlus',
    prefix: process.env.PREFIX === 'null' ? '' : (process.env.PREFIX || '.'),
    description: process.env.BOT_DESCRIPTION || 'A batteries-included WhatsApp bot framework',
    author: process.env.OWNER_NAME || 'WaPlus Developer',
    footer: process.env.BOT_FOOTER || 'Powered by WaPlus'
  },
  branding: {
    title: process.env.BOT_NAME || 'WaPlus',
    version: process.env.BOT_VERSION || '2.0.0',
    author: process.env.OWNER_NAME || 'WaPlus Developer',
    poweredBy: '@musteqeem/baileys',
    thumbUrl: process.env.THUMB_URL || ''
  },
  limits: {
    cooldownMs: Number(process.env.COMMAND_COOLDOWN_MS || 1000),
    maxMediaBytes: Number(process.env.MAX_MEDIA_BYTES || 15000000)
  }
};
module.exports = config;
