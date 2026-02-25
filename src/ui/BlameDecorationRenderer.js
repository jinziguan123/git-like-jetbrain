const { buildBlueSidebarColors } = require("./sidebarTheme");
const { estimateSidebarWidthPx, fitTextToWidth } = require("./sidebarWidth");

function estimateVisibleColumns(editor) {
  const ranges = editor.visibleRanges || [];
  if (ranges.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  let maxSpan = 0;
  let hasHorizontalClipEvidence = false;
  const document = editor.document;

  function tryLineLength(line) {
    if (!document || typeof document.lineAt !== "function") {
      return null;
    }
    try {
      return document.lineAt(line).text.length;
    } catch (error) {
      return null;
    }
  }

  for (const range of ranges) {
    const startCharacter = range.start?.character || 0;
    const endCharacter = range.end?.character || 0;
    const span = Math.max(0, endCharacter - startCharacter);
    const startLine = range.start?.line;
    const endLine = range.end?.line;

    if (startCharacter > 0) {
      hasHorizontalClipEvidence = true;
      if (span > maxSpan) {
        maxSpan = span;
      }
      continue;
    }

    if (startLine === endLine) {
      const lineLength = tryLineLength(startLine);
      if (typeof lineLength === "number" && lineLength > endCharacter + 1) {
        hasHorizontalClipEvidence = true;
        if (span > maxSpan) {
          maxSpan = span;
        }
      }
    }
  }

  if (!hasHorizontalClipEvidence || maxSpan <= 0) {
    return Number.POSITIVE_INFINITY;
  }

  return maxSpan;
}

function shouldHideSidebar(editor, minVisibleColumns) {
  const estimated = estimateVisibleColumns(editor);
  if (!Number.isFinite(estimated)) {
    return false;
  }
  return estimated < minVisibleColumns;
}

class BlameDecorationRenderer {
  constructor(vscode) {
    this.vscode = vscode;
    this.type = vscode.window.createTextEditorDecorationType({
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
      isWholeLine: false
    });
  }

  render(editor, rows, renderConfig = {}) {
    const sidebarMaxWidth = Number.isInteger(renderConfig.sidebarMaxWidth) ? renderConfig.sidebarMaxWidth : 200;
    const minVisibleColumns = Number.isInteger(renderConfig.minVisibleColumns)
      ? renderConfig.minVisibleColumns
      : 95;
    const charWidthPx = Number.isFinite(renderConfig.charWidthPx) ? renderConfig.charWidthPx : 9;
    const horizontalPaddingPx = Number.isFinite(renderConfig.horizontalPaddingPx)
      ? renderConfig.horizontalPaddingPx
      : 16;

    if (shouldHideSidebar(editor, minVisibleColumns)) {
      this.clear(editor);
      return { hidden: true };
    }

    if (rows.length === 0) {
      this.clear(editor);
      return { hidden: false };
    }

    const sidebarWidth = estimateSidebarWidthPx(rows, {
      maxWidthPx: sidebarMaxWidth,
      charWidthPx,
      horizontalPaddingPx
    });

    const options = [];

    for (const row of rows) {
      const lineIndex = row.lineNumber - 1;
      if (lineIndex < 0 || lineIndex >= editor.document.lineCount) {
        continue;
      }

      const line = editor.document.lineAt(lineIndex);
      const colors = buildBlueSidebarColors(row.ageRatio);

      options.push({
        range: new this.vscode.Range(line.range.start, line.range.start),
        renderOptions: {
          before: {
            contentText: ` ${fitTextToWidth(row.fullText, sidebarWidth, { charWidthPx, horizontalPaddingPx })} `,
            color: colors.foreground,
            backgroundColor: colors.background,
            width: `${sidebarWidth}px`,
            margin: "0 12px 0 0",
            textDecoration: "none"
          }
        }
      });
    }

    editor.setDecorations(this.type, options);
    return { hidden: false };
  }

  clear(editor) {
    editor.setDecorations(this.type, []);
  }

  dispose() {
    this.type.dispose();
  }
}

module.exports = {
  BlameDecorationRenderer,
  estimateVisibleColumns,
  shouldHideSidebar
};
