const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");

const { getFileBlamePorcelain } = require("../src/git/gitClient");
const { parsePorcelain } = require("../src/blame/parsePorcelain");

function runGit(cwd, args) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8"
  });
}

test("getFileBlamePorcelain supports unsaved editor contents to keep line mapping aligned", async () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "git-like-jetbrain-"));
  const filePath = path.join(repoRoot, "demo.txt");

  try {
    runGit(repoRoot, ["init", "-q"]);
    runGit(repoRoot, ["config", "user.name", "Tester"]);
    runGit(repoRoot, ["config", "user.email", "tester@example.com"]);

    fs.writeFileSync(filePath, "line1\nline2\nline3\n", "utf8");
    runGit(repoRoot, ["add", "demo.txt"]);
    runGit(repoRoot, ["commit", "-q", "-m", "init"]);

    const unsavedText = "line1\nline1.5\nline2 edited\nline3\n";
    const { porcelain } = await getFileBlamePorcelain(filePath, { contents: unsavedText });
    const parsed = parsePorcelain(porcelain);

    assert.equal(parsed.length, 4);
    assert.deepEqual(
      parsed.map((row) => row.lineNumber),
      [1, 2, 3, 4]
    );
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
});
