const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const path = require("node:path");

const execFileAsync = promisify(execFile);

async function execGit(args, cwd) {
  const { stdout } = await execFileAsync("git", args, {
    cwd,
    timeout: 15000,
    maxBuffer: 10 * 1024 * 1024
  });
  return stdout;
}

async function getRepoRoot(filePath) {
  const dir = path.dirname(filePath);
  const stdout = await execGit(["rev-parse", "--show-toplevel"], dir);
  return stdout.trim();
}

async function getHeadCommit(repoRoot) {
  const stdout = await execGit(["rev-parse", "HEAD"], repoRoot);
  return stdout.trim();
}

async function getFileBlamePorcelain(filePath) {
  const repoRoot = await getRepoRoot(filePath);
  const rel = path.relative(repoRoot, filePath);
  const stdout = await execGit(["blame", "--line-porcelain", "--", rel], repoRoot);
  return {
    repoRoot,
    porcelain: stdout
  };
}

module.exports = {
  execGit,
  getRepoRoot,
  getHeadCommit,
  getFileBlamePorcelain
};
