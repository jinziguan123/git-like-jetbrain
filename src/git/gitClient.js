const { execFile, spawn } = require("node:child_process");
const { promisify } = require("node:util");
const path = require("node:path");
const { realpath } = require("node:fs/promises");

const execFileAsync = promisify(execFile);
const MAX_BUFFER = 10 * 1024 * 1024;
const GIT_TIMEOUT_MS = 15000;

async function execGit(args, cwd) {
  const { stdout } = await execFileAsync("git", args, {
    cwd,
    timeout: GIT_TIMEOUT_MS,
    maxBuffer: MAX_BUFFER
  });
  return stdout;
}

async function execGitWithInput(args, cwd, input) {
  return new Promise((resolve, reject) => {
    const child = spawn("git", args, {
      cwd,
      stdio: ["pipe", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let settled = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, GIT_TIMEOUT_MS);

    function cleanup() {
      clearTimeout(timer);
    }

    function fail(error) {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(error);
    }

    function succeed(output) {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve(output);
    }

    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      if (stdout.length > MAX_BUFFER) {
        child.kill("SIGKILL");
        fail(new Error(`Command failed: git ${args.join(" ")}\nstdout exceeded maxBuffer`));
      }
    });

    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
      if (stderr.length > MAX_BUFFER) {
        child.kill("SIGKILL");
        fail(new Error(`Command failed: git ${args.join(" ")}\nstderr exceeded maxBuffer`));
      }
    });

    child.on("error", (error) => {
      fail(error);
    });

    child.on("close", (code) => {
      if (timedOut) {
        fail(new Error(`Command failed: git ${args.join(" ")}\nprocess timed out`));
        return;
      }
      if (code === 0) {
        succeed(stdout);
        return;
      }
      const detail = stderr.trim() || `exit code ${code}`;
      fail(new Error(`Command failed: git ${args.join(" ")}\n${detail}`));
    });

    child.stdin.end(typeof input === "string" ? input : "");
  });
}

function isPathOutsideRepo(relPath) {
  return relPath.startsWith("..") || path.isAbsolute(relPath);
}

async function toRealPathSafe(targetPath) {
  try {
    return await realpath(targetPath);
  } catch (error) {
    return path.resolve(targetPath);
  }
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

async function getFileBlamePorcelain(filePath, options = {}) {
  const repoRootRaw = await getRepoRoot(filePath);
  const repoRoot = await toRealPathSafe(repoRootRaw);
  const resolvedFilePath = await toRealPathSafe(filePath);
  let rel = path.relative(repoRoot, resolvedFilePath);

  if (isPathOutsideRepo(rel)) {
    rel = path.relative(repoRootRaw, filePath);
  }
  if (isPathOutsideRepo(rel)) {
    throw new Error(`Cannot resolve repository-relative path for ${filePath}`);
  }

  const blameArgs = ["blame", "--line-porcelain"];
  const contents = typeof options.contents === "string" ? options.contents : null;
  if (contents !== null) {
    blameArgs.push("--contents", "-");
  }
  blameArgs.push("--", rel);

  const stdout =
    contents === null
      ? await execGit(blameArgs, repoRoot)
      : await execGitWithInput(blameArgs, repoRoot, contents);

  return {
    repoRoot,
    porcelain: stdout
  };
}

module.exports = {
  execGit,
  execGitWithInput,
  getRepoRoot,
  getHeadCommit,
  getFileBlamePorcelain
};
