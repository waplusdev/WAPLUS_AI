const os = require('os');

module.exports = {
  name: 'runtime',
  alias: ['uptime', 'system'],
  desc: 'System report',
  async run({ reply, ui, stats }) {
    const { fonts } = ui;
    const mem = process.memoryUsage();
    const used = os.totalmem() - os.freemem();
    const started = new Date(stats.startedAt).toLocaleString('en-GB', { hour12: false });

    const text = [
      `⌁ ${fonts.bold('SYSTEM REPORT')}`,
      `${fonts.smallCaps('live diagnostics')}`,
      '',
      `┌ ◷ ${fonts.smallCaps('started')}`,
      `│   ${fonts.mono(started)}`,
      `├ ◴ ${fonts.smallCaps('running for')}`,
      `│   ${fonts.bold(ui.duration(process.uptime() * 1000))}`,
      `├ ◶ ${fonts.smallCaps('server uptime')}`,
      `│   ${fonts.mono(ui.duration(os.uptime() * 1000))}`,
      `└ ◵ ${fonts.smallCaps('activity')}`,
      `    ${fonts.mono(`${stats.messages} msgs · ${stats.commands} cmds`)}`,
      '',
      `${fonts.smallCaps('ram')}  ${fonts.mono(`${ui.bytes(used)} / ${ui.bytes(os.totalmem())}`)}`,
      ui.bar((used / os.totalmem()) * 100),
      `${fonts.smallCaps('heap')}  ${fonts.mono(`${ui.bytes(mem.heapUsed)} / ${ui.bytes(mem.heapTotal)}`)}`,
      ui.bar((mem.heapUsed / mem.heapTotal) * 100),
      '',
      `⋄ ${fonts.mono(`${os.platform()} ${os.arch()} · ${os.cpus().length} cores · node ${process.version}`)}`,
      '',
      ui.footer(),
    ].join('\n');

    await reply(text);
  },
};
