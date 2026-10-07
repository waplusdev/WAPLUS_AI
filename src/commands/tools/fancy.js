module.exports = {
  name: 'fancy',
  alias: ['font', 'style'],
  desc: 'Stylish unicode text',
  usage: '.fancy <text>',
  async run({ text, reply, ui, prefix, m }) {
    const { fonts } = ui;
    const input = text || m.quoted?.body;
    if (!input) return reply(ui.notice('info', 'Fancy text', `${fonts.mono(`${prefix}fancy WaPlus Bot`)}`));

    const styles = [
      ['bold', fonts.bold(input)],
      ['serif', fonts.serif(input)],
      ['italic', fonts.italic(input)],
      ['mono', fonts.mono(input)],
      ['small caps', fonts.smallCaps(input)],
      ['spaced', fonts.bold(fonts.spaced(input))],
      ['framed', `「 ${fonts.bold(input)} 」`],
      ['royal', `⟡ ${fonts.serif(input)} ⟡`],
    ];

    await reply(
      [
        `❖ ${fonts.bold('FANCY STUDIO')}`,
        `${fonts.smallCaps('long press any line to copy')}`,
        '',
        ...styles.map(([name, value], i) => `${fonts.mono(String(i + 1).padStart(2, '0'))} ┊ ${fonts.smallCaps(name)}\n   ${value}`),
        '',
        ui.footer(),
      ].join('\n'),
    );
  },
};
