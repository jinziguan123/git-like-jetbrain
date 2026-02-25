const test = require("node:test");
const assert = require("node:assert/strict");

const { formatRelativeTime } = require("../src/time/formatRelativeTime");

test("formatRelativeTime formats minutes and days", () => {
  const now = 1_700_000_000;

  assert.equal(formatRelativeTime(now - 120, now), "2m ago");
  assert.equal(formatRelativeTime(now - 7200, now), "2h ago");
  assert.equal(formatRelativeTime(now - 172800, now), "2d ago");
});
