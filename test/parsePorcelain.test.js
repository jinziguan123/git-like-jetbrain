const test = require("node:test");
const assert = require("node:assert/strict");

const { parsePorcelain } = require("../src/blame/parsePorcelain");

test("parsePorcelain maps each content line to author and time", () => {
  const input = [
    "9fceb02 1 1 1",
    "author Alice",
    "author-time 1700000000",
    "\tconst a = 1;",
    "9fceb02 2 2 1",
    "author Bob",
    "author-time 1700003600",
    "\tconst b = 2;"
  ].join("\n");

  const result = parsePorcelain(input);

  assert.equal(result.length, 2);
  assert.deepEqual(result[0], {
    revision: "9fceb02",
    lineNumber: 1,
    author: "Alice",
    authorTime: 1700000000
  });
  assert.deepEqual(result[1], {
    revision: "9fceb02",
    lineNumber: 2,
    author: "Bob",
    authorTime: 1700003600
  });
});

test("parsePorcelain keeps zero revision for uncommitted rows", () => {
  const input = [
    "0000000000000000000000000000000000000000 7 3 1",
    "author External file (--contents)",
    "author-time 1700009999",
    "\tnew line"
  ].join("\n");

  const result = parsePorcelain(input);

  assert.equal(result.length, 1);
  assert.equal(result[0].revision, "0000000000000000000000000000000000000000");
  assert.equal(result[0].lineNumber, 3);
  assert.equal(result[0].author, "External file (--contents)");
});
