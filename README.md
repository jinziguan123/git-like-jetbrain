# Git Like JetBrains Annotate

VSCode/Cursor extension that provides JetBrains-style per-line Git blame annotation with a line-number context menu toggle.

中文文档: `README.zh-CN.md`

## Features

- Right-click line number to toggle annotation:
  - `Annotate with Git Blame`
  - `Hide Git Blame Annotation`
  - `Refresh Git Blame Annotation`
- Annotation shows `author + relative time` at the end of each line.
- Scope is file-only: enabling one file does not enable other files.
- Auto refresh triggers:
  - on save
  - on editor activation
  - on Git HEAD change polling

## Requirements

- Node.js 18+ (tested with Node 23)
- Git available in `PATH`
- VSCode/Cursor version compatible with `engines.vscode` in `package.json`

## Project Layout

- `extension.js`: extension activation, command registration, refresh orchestration
- `src/git`: git command execution and repository/head resolution
- `src/blame`: porcelain parser and row label assembly
- `src/ui`: line-end decoration renderer
- `src/state`: file-scoped annotation state
- `test`: Node built-in test runner based unit tests

## Install Dependencies

This repository currently uses only built-in Node modules and has no external npm dependencies.

## Run Tests

```bash
npm test
```

## Debug In VSCode

1. Open this repository folder in VSCode.
2. Press `F5` (or Run and Debug -> Start Debugging).
3. In the Extension Development Host window, open a file inside a Git repository.
4. Right-click the line number gutter and choose `Annotate with Git Blame`.
5. Right-click again to use `Hide Git Blame Annotation` or `Refresh Git Blame Annotation`.

## Debug In Cursor

Cursor is VSCode-compatible for extension development in most workflows.

1. Open this repository in Cursor.
2. Start extension debugging using Cursor's Run/Debug flow (same as VSCode-style Extension Host).
3. In the Extension Host window, open a Git-tracked file and use the line-number right-click menu.

## Behavior Notes

- Non-file editors and non-Git files are ignored by commands.
- If `git blame` fails for a file, the extension clears decoration and shows warning on annotate action.
- Annotation is best-effort and may be temporarily stale while editing unsaved content; save will refresh.

## Current Limitations

- No commit message/hash display (by design for compact UI).
- No workspace-global toggle (file-only by design).
- No packaged `.vsix` build pipeline in this repository yet.
