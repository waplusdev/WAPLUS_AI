const { getByCategory, getUnique, count } = require('./xdnCmd');
const { allVars } = require('./configManager');

module.exports = (app, io) => {
  // › health
  app.get('/api/health', (_, res) => {
    let version = '1.0.0';
    try { version = require('../../package.json').version; } catch {}
    res.json({
      ok: true,
      name: 'WaPlus',
      version,
      uptime: Math.floor(process.uptime()),
      mem: process.memoryUsage(),
      ts: Date.now()
    });
  });

  // › bot stats
  app.get('/api/stats', (_, res) => {
    const s = global.botStats || {};
    res.json({
     ...s,
      uptime: Math.floor(process.uptime()),
      commandsLoaded: count(),
      runtimeVars: Object.keys(allVars()).length,
      ts: Date.now()
    });
  });

  // › commands grouped
  app.get('/api/commands', (_, res) => {
    res.json(getByCategory());
  });

  // › commands flat
  app.get('/api/commands/list', (_, res) => {
    const list = getUnique().map(c => ({
      name: c.name,
      category: c.category || 'General',
      desc: c.desc || '',
      alias: c.alias || [],
      file: c.file || ''
    }));
    res.json(list);
  });

  // › runtime config dump (safe)
  app.get('/api/config', (_, res) => res.json(allVars()));

  // › simple web ping
  app.get('/api/ping', (_, res) => res.json({ ping: 'pong', at: new Date().toISOString() }));

  // › live push
  const t = setInterval(() => {
    if (!global.botStats) return;
    global.botStats.uptime = Math.floor(process.uptime());
    io?.emit('stats-update', global.botStats);
    io?.emit('cmd-count', count());
  }, 5000);
  t.unref?.();
};