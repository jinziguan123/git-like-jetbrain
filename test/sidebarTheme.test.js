const test = require("node:test");
const assert = require("node:assert/strict");

const { buildBlueSidebarColors } = require("../src/ui/sidebarTheme");

test("buildBlueSidebarColors maps newer commit to lighter blue", () => {
  const newer = buildBlueSidebarColors(0);
  const older = buildBlueSidebarColors(1);

  assert.equal(newer.background, "rgba(147, 197, 253, 0.18)");
  assert.equal(older.background, "rgba(30, 64, 175, 0.42)");
  assert.equal(newer.foreground, "rgba(191, 219, 254, 0.86)");
  assert.equal(older.foreground, "rgba(239, 246, 255, 0.98)");
});

test("buildBlueSidebarColors interpolates midpoint", () => {
  const mid = buildBlueSidebarColors(0.5);
  assert.equal(mid.background, "rgba(89, 131, 214, 0.30)");
  assert.equal(mid.foreground, "rgba(215, 233, 255, 0.92)");
});
