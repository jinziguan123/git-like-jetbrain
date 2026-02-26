const test = require("node:test");
const assert = require("node:assert/strict");

const { BlameDecorationRenderer } = require("../src/ui/BlameDecorationRenderer");

function createMockVscode() {
  return {
    DecorationRangeBehavior: {
      ClosedClosed: 0
    },
    Range: class Range {
      constructor(start, end) {
        this.start = start;
        this.end = end;
      }
    },
    window: {
      createTextEditorDecorationType() {
        return {
          dispose() {}
        };
      }
    }
  };
}

function createMockEditor(lineCount) {
  const captured = [];
  const editor = {
    visibleRanges: [],
    document: {
      lineCount,
      lineAt(line) {
        return {
          text: `line-${line + 1}`,
          range: {
            start: { line, character: 0 },
            end: { line, character: 8 }
          }
        };
      }
    },
    setDecorations(type, options) {
      captured.length = 0;
      captured.push(...options);
    }
  };
  return { editor, captured };
}

test("renderer keeps placeholder width for blank annotation rows", () => {
  const vscode = createMockVscode();
  const renderer = new BlameDecorationRenderer(vscode);
  const { editor, captured } = createMockEditor(3);
  const rows = [
    { lineNumber: 1, fullText: "2026/02/26 alice", ageRatio: 0.7 },
    { lineNumber: 2, fullText: "", ageRatio: 0 },
    { lineNumber: 3, fullText: "2026/02/24 bob", ageRatio: 1 }
  ];

  renderer.render(editor, rows, {
    sidebarMaxWidth: 200,
    minVisibleColumns: 95
  });

  assert.equal(captured.length, 3);
  assert.equal(captured[1].range.start.line, 1);
  assert.equal(captured[1].renderOptions.before.width, captured[0].renderOptions.before.width);
  assert.equal(captured[1].renderOptions.before.contentText.trim(), "");
});
