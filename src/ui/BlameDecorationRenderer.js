class BlameDecorationRenderer {
  constructor(vscode) {
    this.vscode = vscode;
    this.type = vscode.window.createTextEditorDecorationType({
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
      isWholeLine: false
    });
  }

  render(editor, rows) {
    const options = [];

    for (const row of rows) {
      const lineIndex = row.lineNumber - 1;
      if (lineIndex < 0 || lineIndex >= editor.document.lineCount) {
        continue;
      }

      const line = editor.document.lineAt(lineIndex);
      options.push({
        range: line.range,
        renderOptions: {
          after: {
            contentText: `  ${row.label}`,
            color: new this.vscode.ThemeColor("editorCodeLens.foreground"),
            margin: "0 0 0 2em"
          }
        }
      });
    }

    editor.setDecorations(this.type, options);
  }

  clear(editor) {
    editor.setDecorations(this.type, []);
  }

  dispose() {
    this.type.dispose();
  }
}

module.exports = {
  BlameDecorationRenderer
};
