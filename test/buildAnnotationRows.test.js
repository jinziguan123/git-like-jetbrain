const test = require("node:test");
const assert = require("node:assert/strict");

const { buildAnnotationRows } = require("../src/blame/buildAnnotationRows");

test("buildAnnotationRows returns sidebar text and age ratio", () => {
  const porcelain = [
    "aaaaaaaa 1 1 1",
    "author Alice",
    "author-time 1704067200",
    "\tline 1",
    "bbbbbbbb 2 2 1",
    "author Bob",
    "author-time 1704153600",
    "\tline 2"
  ].join("\n");

  const rows = buildAnnotationRows(porcelain, { maxChars: 24 });

  assert.equal(rows.length, 2);
  assert.equal(rows[0].displayText, "2024/01/01 Alice");
  assert.equal(rows[1].displayText, "2024/01/02 Bob");
  assert.equal(rows[0].ageRatio, 1);
  assert.equal(rows[1].ageRatio, 0);
});

test("buildAnnotationRows truncates long author names with ellipsis", () => {
  const porcelain = [
    "aaaaaaaa 1 1 1",
    "author very-very-long-author-name",
    "author-time 1704067200",
    "\tline 1"
  ].join("\n");

  const rows = buildAnnotationRows(porcelain, { maxChars: 22 });

  assert.equal(rows.length, 1);
  assert.equal(rows[0].displayText.length <= 22, true);
  assert.equal(rows[0].displayText.endsWith("..."), true);
});
