const BASE = 'https://api.github.com';

function token() { return process.env.GITHUB_TOKEN || ''; }

async function github(path, options = {}) {
  if (!token()) throw new Error('GITHUB_TOKEN is not configured');
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token()}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {})
    }
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text) } catch { data = { message: text.slice(0, 500) } }
  if (!res.ok) throw new Error(data.message || `GitHub HTTP ${res.status}`);
  return data;
}

// › repos
async function repos(owner = process.env.GITHUB_OWNER) {
  if (!owner) throw new Error('GITHUB_OWNER not set');
  return github(`/users/${encodeURIComponent(owner)}/repos?per_page=100&sort=updated`);
}
async function repoInfo(repo) {
  return github(`/repos/${repo}`);
}
async function commits(repo, limit = 5) {
  return github(`/repos/${repo}/commits?per_page=${limit}`);
}
async function branches(repo) {
  return github(`/repos/${repo}/branches?per_page=50`);
}

// › issues / prs
async function issues(repo, state = 'open') {
  return github(`/repos/${repo}/issues?state=${state}&per_page=20`);
}
async function createIssue(repo, title, body) {
  return github(`/repos/${repo}/issues`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title, body: body?.slice(0, 6000) })
  });
}
async function closeIssue(repo, num) {
  return github(`/repos/${repo}/issues/${num}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ state: 'closed' })
  });
}

// › actions
async function workflow(repo, workflowId, ref = 'main', inputs = {}) {
  return github(`/repos/${repo}/actions/workflows/${workflowId}/dispatches`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ref, inputs })
  });
}
async function runs(repo, limit = 5) {
  return github(`/repos/${repo}/actions/runs?per_page=${limit}`);
}
async function file(repo, filePath, ref = 'main') {
  return github(`/repos/${repo}/contents/${filePath}?ref=${ref}`);
}

// › search
async function searchRepos(q) {
  return github(`/search/repositories?q=${encodeURIComponent(q)}&per_page=10`);
}

module.exports = {
  github,
  repos, repoInfo, commits, branches,
  issues, createIssue, closeIssue,
  workflow, runs, file,
  searchRepos
};