import fs from 'fs';
import { Octokit } from '@octokit/rest';

const tasks = JSON.parse(fs.readFileSync('tasks.json', 'utf8'));
const token = process.env.GITHUB_TOKEN;
const repoEnv = process.env.REPO; // like "YourUserName/EchoApp"

if (!token || !repoEnv) {
  console.error('Set REPO="owner/repo" and GITHUB_TOKEN env vars first.');
  process.exit(1);
}

const octokit = new Octokit({ auth: token });

async function run() {
  const [owner, repo] = repoEnv.split('/');
  for (const t of tasks) {
    const params = {
      owner,
      repo,
      title: t.title,
      body: t.body || '',
      labels: t.labels || []
    };
    if (t.assignees && t.assignees.length) params.assignees = t.assignees;
    try {
      const res = await octokit.issues.create(params);
      console.log(`Created #${res.data.number} ${res.data.title}`);
    } catch (err) {
      console.error('Error creating', t.title, '->', err.message);
    }
  }
}

run();
