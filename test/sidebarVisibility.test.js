const test = require("node:test");
const assert = require("node:assert/strict");

const {
  estimateVisibleColumns,
  shouldHideSidebar
} = require("../src/ui/BlameDecorationRenderer");

test("estimateVisibleColumns uses visible range character span first", () => {
  const editorLike = {
    visibleRanges: [{ start: { character: 2 }, end: { character: 122 } }],
    options: { wordWrapColumn: 80 }
  };
  assert.equal(estimateVisibleColumns(editorLike), 120);
});

test("shouldHideSidebar returns true when estimated columns are below threshold", () => {
  const editorLike = {
    visibleRanges: [{ start: { character: 0 }, end: { character: 60 } }],
    options: { wordWrapColumn: 80 }
  };
  assert.equal(shouldHideSidebar(editorLike, 100), true);
  assert.equal(shouldHideSidebar(editorLike, 50), false);
});
