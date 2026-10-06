const { repos, issues, createIssue, workflow, gh } = require('../../core/github');

module.exports = {
  name: 'github',
  alias: ['gh', 'git'],
  desc: 'Control your GitHub account from WhatsApp',
  category: 'Developer',

  execute: async (sock, message, { args, text, reply, requireOwner, prefix }) => {
    requireOwner();
    const action = (args[0] || 'help').toLowerCase();
    const sub = args[1];

    const fmt = (t) => t; // keep raw for speed

    try {
      // › status
      if (action === 'status') {
        const ready = process.env.GITHUB_TOKEN? 'READY' : 'NOT CONFIGURED';
        let out = '';
        out += `*┌─ ✦ GITHUB ✦*\n`;
        out += `├─ › Token : \`${ready}\`\n`;
        out += `├─ › Owner : \`${process.env.GITHUB_OWNER || 'not set'}\`\n`;
        out += `├─ › API : \`api.github.com\`\n`;
        out += `└─ _${prefix}github help for list_`;
        return reply(out);
      }

      // › repos
      if (action === 'repos' || action === 'ls') {
        const data = await repos();
        if (!data.length) return reply(`_› No repositories_`);
        let out = `*┌─ ✦ REPOS [${data.length}] ✦*\n`;
        data.slice(0, 20).forEach((r, i) => {
          const isLast = i === Math.min(data.length, 20) - 1;
          out += `${isLast? '└' : '├'}─ \`${r.full_name}\` ${r.private? '[priv]' : ''} › ⭐${r.stargazers_count}\n`;
        });
        return reply(out.trim());
      }

      // › issues
      if (action === 'issues') {
        if (!sub) return reply(`_Usage:_ \`${prefix}github issues owner/repo\``);
        const data = await issues(sub);
        if (!data.length) return reply(`_› No open issues in \`${sub}\`_`);
        let out = `*┌─ ✦ ISSUES › ${sub} ✦*\n`;
        data.slice(0, 15).forEach((i, idx) => {
          out += `${idx === data.length - 1 || idx === 14? '└' : '├'}─ \`#${i.number}\` ${i.title.slice(0, 60)}\n`;
        });
        return reply(out.trim());
      }

      // › commits
      if (action === 'commits' || action === 'log') {
        if (!sub) return reply(`_Usage:_ \`${prefix}github commits owner/repo\``);
        const data = await gh(`/repos/${sub}/commits?per_page=10`);
        let out = `*┌─ ✦ COMMITS › ${sub} ✦*\n`;
        data.forEach((c, i) => {
          const msg = c.commit.message.split('\n')[0].slice(0, 50);
          out += `${i === data.length - 1? '└' : '├'}─ \`${c.sha.slice(0, 7)}\` ${msg} — _${c.commit.author.name}_\n`;
        });
        return reply(out.trim());
      }

      // › file / content
      if (action === 'file' || action === 'cat' || action === 'view') {
        const repo = sub;
        const filePath = args[2];
        if (!repo ||!filePath) return reply(`_Usage:_ \`${prefix}github file owner/repo path/to/file\``);
        const data = await gh(`/repos/${repo}/contents/${filePath}`);
        const content = Buffer.from(data.content, 'base64').toString('utf8').slice(0, 3000);
        return reply(`*› ${repo}/${filePath}*\n\`\`\`${content}\`\`\``);
      }

      // › create issue
      if (action === 'issue' || action === 'newissue') {
        const repo = sub;
        const title = text.split(/\s+/).slice(2).join(' ').trim();
        if (!repo ||!title) return reply(`_Usage:_ \`${prefix}github issue owner/repo <title>\``);
        const i = await createIssue(repo, title, `Created from WaPlus by ${message.sender}`);
        return reply(`*┌─ ✦ ISSUE CREATED ✦*\n├─ › \`#${i.number}\` ${i.title}\n└─ › ${i.html_url}`);
      }

      // › close issue
      if (action === 'close') {
        const repo = sub;
        const num = args[2];
        if (!repo ||!num) return reply(`_Usage:_ \`${prefix}github close owner/repo <num>\``);
        await gh(`/repos/${repo}/issues/${num}`, 'PATCH', { state: 'closed' });
        return reply(`_› Closed \`#${num}\` in \`${repo}\`_`);
      }

      // › star
      if (action === 'star') {
        if (!sub) return reply(`_Usage:_ \`${prefix}github star owner/repo\``);
        await gh(`/user/starred/${sub}`, 'PUT');
        return reply(`_› Starred \`${sub}\` ⭐_`);
      }

      // › unstar
      if (action === 'unstar') {
        if (!sub) return reply(`_Usage:_ \`${prefix}github unstar owner/repo\``);
        await gh(`/user/starred/${sub}`, 'DELETE');
        return reply(`_› Unstarred \`${sub}\`_`);
      }

      // › fork
      if (action === 'fork') {
        if (!sub) return reply(`_Usage:_ \`${prefix}github fork owner/repo\``);
        const d = await gh(`/repos/${sub}/forks`, 'POST');
        return reply(`*› Forked*\n_› ${d.html_url}_`);
      }

      // › create repo
      if (action === 'create' || action === 'newrepo') {
        const name = sub;
        if (!name) return reply(`_Usage:_ \`${prefix}github create <repo-name> [private]\``);
        const isPrivate = args[2] === 'private';
        const d = await gh(`/user/repos`, 'POST', { name, private: isPrivate });
        return reply(`*┌─ ✦ REPO CREATED ✦*\n├─ › \`${d.full_name}\`\n└─ › ${d.html_url}`);
      }

      // › delete repo [danger]
      if (action === 'delete' || action === 'del') {
        if (!sub) return reply(`_Usage:_ \`${prefix}github delete owner/repo\``);
        if (args[2]!== '--confirm') return reply(`_› Danger: this deletes repo_\n_Use:_ \`${prefix}github delete ${sub} --confirm\``);
        await gh(`/repos/${sub}`, 'DELETE');
        return reply(`_› Deleted \`${sub}\`_`);
      }

      // › workflow dispatch
      if (action === 'dispatch' || action === 'run') {
        const repo = sub, workflowId = args[2], ref = args[3] || 'main';
        if (!repo ||!workflowId) return reply(`_Usage:_ \`${prefix}github dispatch owner/repo workflow.yml [branch]\``);
        await workflow(repo, workflowId, ref);
        return reply(`*› Workflow dispatched*\n_› ${workflowId} on ${ref} in ${repo}_`);
      }

      // › pr list
      if (action === 'pr' || action === 'prs') {
        if (!sub) return reply(`_Usage:_ \`${prefix}github pr owner/repo\``);
        const data = await gh(`/repos/${sub}/pulls?state=open&per_page=10`);
        if (!data.length) return reply(`_› No open PRs in \`${sub}\`_`);
        let out = `*┌─ ✦ PRS › ${sub} ✦*\n`;
        data.forEach((p, i) => {
          out += `${i === data.length - 1? '└' : '├'}─ \`#${p.number}\` ${p.title.slice(0, 60)} — @${p.user.login}\n`;
        });
        return reply(out.trim());
      }

      // › help
      let help = '';
      help += `*┌─ ✦ GITHUB COMMANDS ✦*\n`;
      help += `├─ \`${prefix}gh status\` — check config\n`;
      help += `├─ \`${prefix}gh repos\` — list repos\n`;
      help += `├─ \`${prefix}gh commits owner/repo\` — recent commits\n`;
      help += `├─ \`${prefix}gh file owner/repo path\` — view file\n`;
      help += `├─ \`${prefix}gh issues owner/repo\` — open issues\n`;
      help += `├─ \`${prefix}gh pr owner/repo\` — open PRs\n`;
      help += `├─ \`${prefix}gh issue owner/repo title\` — create issue\n`;
      help += `├─ \`${prefix}gh close owner/repo #\` — close issue\n`;
      help += `├─ \`${prefix}gh star/unstar owner/repo\`\n`;
      help += `├─ \`${prefix}gh fork owner/repo\`\n`;
      help += `├─ \`${prefix}gh create <name> [private]\`\n`;
      help += `├─ \`${prefix}gh dispatch owner/repo workflow.yml\`\n`;
      help += `└─ \`${prefix}gh delete owner/repo --confirm\` _danger_`;
      return reply(help);

    } catch (e) {
      return reply(`*┌─ ✦ ERROR ✦*\n└─ _${e.message}_`);
    }
  },
};