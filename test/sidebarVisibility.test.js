const test = require("node:test");
const assert = require("node:assert/strict");

const {
  estimateVisibleColumns,
  shouldHideSidebar
} = require("../src/ui/BlameDecorationRenderer");

test("estimateVisibleColumns uses visible range character span first", () => {
  const editorLike = {
    visibleRanges: [{ start: { line: 0, character: 2 }, end: { line: 0, character: 122 } }],
    document: {
      lineAt(line) {
        return { text: "x".repeat(200) };
      }
    }
  };
  assert.equal(estimateVisibleColumns(editorLike), 120);
});

test("estimateVisibleColumns returns Infinity when there is no clip evidence", () => {
  const editorLike = {
    visibleRanges: [{ start: { line: 0, character: 0 }, end: { line: 0, character: 60 } }],
    document: {
      lineAt(line) {
        return { text: "x".repeat(60) };
      }
    }
  };
  assert.equal(Number.isFinite(estimateVisibleColumns(editorLike)), false);
});

test("shouldHideSidebar returns true when estimated columns are below threshold", () => {
  const editorLike = {
    visibleRanges: [{ start: { line: 0, character: 0 }, end: { line: 0, character: 60 } }],
    document: {
      lineAt(line) {
        return { text: "x".repeat(120) };
      }
    }
  };
  assert.equal(shouldHideSidebar(editorLike, 100), true);
  assert.equal(shouldHideSidebar(editorLike, 50), false);
});

test("shouldHideSidebar returns false when visibility cannot prove narrow width", () => {
  const editorLike = {
    visibleRanges: [{ start: { line: 0, character: 0 }, end: { line: 0, character: 60 } }],
    document: {
      lineAt(line) {
        return { text: "x".repeat(60) };
      }
    }
  };
  assert.equal(shouldHideSidebar(editorLike, 100), false);
});
