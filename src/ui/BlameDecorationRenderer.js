const { buildBlueSidebarColors } = require("./sidebarTheme");
const { estimateSidebarWidthPx, fitTextToWidth } = require("./sidebarWidth");

function estimateVisibleColumns(editor) {
  const ranges = editor.visibleRanges || [];
  for (const range of ranges) {
    const span = (range.end?.character || 0) - (range.start?.character || 0);
    if (span > 0) {
      return span;
    }
  }

  const wrapColumn = editor.options?.wordWrapColumn;
  if (Number.isInteger(wrapColumn) && wrapColumn > 0) {
    return wrapColumn;
  }

  return 120;
}

function shouldHideSidebar(editor, minVisibleColumns) {
  return estimateVisibleColumns(editor) < minVisibleColumns;
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
