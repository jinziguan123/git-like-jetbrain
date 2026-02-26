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

  const rows = buildAnnotationRows(porcelain);

  assert.equal(rows.length, 2);
  assert.equal(rows[0].fullText, "2024/01/01 Alice");
  assert.equal(rows[1].fullText, "2024/01/02 Bob");
  assert.equal(rows[0].ageRatio, 1);
  assert.equal(rows[1].ageRatio, 0);
});

test("buildAnnotationRows keeps full text for renderer-side truncation", () => {
  const porcelain = [
    "aaaaaaaa 1 1 1",
    "author very-very-long-author-name",
    "author-time 1704067200",
    "\tline 1"
  ].join("\n");

  const rows = buildAnnotationRows(porcelain);

  assert.equal(rows.length, 1);
  assert.equal(rows[0].fullText, "2024/01/01 very-very-long-author-name");
});

test("buildAnnotationRows leaves uncommitted lines blank", () => {
  const porcelain = [
    "aaaaaaaa 1 1 1",
    "author Alice",
    "author-time 1704067200",
    "\tline 1",
    "0000000000000000000000000000000000000000 2 2 1",
    "author Not Committed Yet",
    "author-time 1704153600",
    "\tline 2"
  ].join("\n");

  const rows = buildAnnotationRows(porcelain);

  assert.equal(rows.length, 2);
  assert.equal(rows[0].fullText, "2024/01/01 Alice");
  assert.equal(rows[1].fullText, "");
});

test("buildAnnotationRows leaves zero-revision rows blank even with external author labels", () => {
  const porcelain = [
    "aaaaaaaa 1 1 1",
    "author Alice",
    "author-time 1704067200",
    "\tline 1",
    "0000000000000000000000000000000000000000 2 2 1",
    "author External file (--contents)",
    "author-time 1704153600",
    "\tline 2"
  ].join("\n");

  const rows = buildAnnotationRows(porcelain);

  assert.equal(rows.length, 2);
  assert.equal(rows[0].fullText, "2024/01/01 Alice");
  assert.equal(rows[1].fullText, "");
  assert.equal(rows[1].ageRatio, 0);
});
