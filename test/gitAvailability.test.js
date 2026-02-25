const test = require("node:test");
const assert = require("node:assert/strict");

const { createGitAvailabilityChecker } = require("../src/git/gitAvailability");

test("git availability checker caches success within TTL", async () => {
  let calls = 0;
  let now = 1000;
  const checker = createGitAvailabilityChecker({
    getRepoRootFn: async () => {
      calls += 1;
      return "/repo";
    },
    nowFn: () => now,
    ttlMs: 5000
  });

  assert.equal(await checker("/a.ts"), true);
  assert.equal(await checker("/a.ts"), true);
  assert.equal(calls, 1);

  now += 6000;
  assert.equal(await checker("/a.ts"), true);
  assert.equal(calls, 2);
});

test("git availability checker caches failure within TTL", async () => {
  let calls = 0;
  let now = 1000;
  const checker = createGitAvailabilityChecker({
    getRepoRootFn: async () => {
      calls += 1;
      throw new Error("not git");
    },
    nowFn: () => now,
    ttlMs: 5000
  });

  assert.equal(await checker("/b.ts"), false);
  assert.equal(await checker("/b.ts"), false);
  assert.equal(calls, 1);
});
