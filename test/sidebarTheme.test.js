const test = require("node:test");
const assert = require("node:assert/strict");

const { buildBlueSidebarColors, toBucketIndex } = require("../src/ui/sidebarTheme");

test("buildBlueSidebarColors uses 5-step bucketed blue backgrounds", () => {
  assert.equal(buildBlueSidebarColors(0).background, "rgba(90, 144, 245, 0.62)");
  assert.equal(buildBlueSidebarColors(0.45).background, "rgba(75, 127, 220, 0.53)");
  assert.equal(buildBlueSidebarColors(0.6).background, "rgba(58, 108, 193, 0.45)");
  assert.equal(buildBlueSidebarColors(0.75).background, "rgba(43, 87, 160, 0.38)");
  assert.equal(buildBlueSidebarColors(1).background, "rgba(31, 67, 128, 0.32)");
});

test("buildBlueSidebarColors keeps foreground color globally uniform", () => {
  const levels = [0, 0.2, 0.5, 0.75, 1].map((ratio) => buildBlueSidebarColors(ratio).foreground);
  for (const color of levels) {
    assert.equal(color, "rgba(230, 236, 245, 0.96)");
  }
});

test("toBucketIndex uses non-linear mapping to keep newer commits in highlighted buckets", () => {
  assert.equal(toBucketIndex(0), 0);
  assert.equal(toBucketIndex(0.2), 0);
  assert.equal(toBucketIndex(0.45), 1);
  assert.equal(toBucketIndex(0.6), 2);
  assert.equal(toBucketIndex(0.75), 3);
  assert.equal(toBucketIndex(1), 4);
});
