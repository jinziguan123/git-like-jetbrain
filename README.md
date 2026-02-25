# Git Like JetBrains Annotate

VSCode/Cursor extension that provides JetBrains-like per-line Git blame annotation through the line-number right-click menu.

Chinese documentation: `README.zh-CN.md`

## Current Behavior

- Annotation is rendered in a **left sidebar** (not at line end).
- Per-line text format is `YYYY/MM/DD author`.
- Sidebar color uses a blue age gradient:
  - newer commit -> lighter blue
  - older commit -> darker blue
- Scope is **current file only**.
- Width strategy:
  - auto-size from the longest annotation text in the current file
  - capped by max width (`gitLikeJetbrain.sidebarMaxWidth`, default `200`)
  - overflow text is truncated with `...`

## Context Menu Commands

Right-click the line number gutter:

- `Annotate with Git Blame`
- `Hide Git Blame Annotation`
- `Refresh Git Blame Annotation`

For non-Git files, a disabled menu item is shown:

- `Annotate with Git Blame (File Not In Git Repository)`

## Refresh and Visibility

Auto refresh triggers:

- save file
- active editor change
- visible range change
- extension config change
- Git HEAD polling change

Sidebar may be hidden when editor width is truly too narrow (based on clipping evidence). If hidden, widening layout and refreshing will restore it.

## Settings

```json
{
  "gitLikeJetbrain.sidebarMaxWidth": 200,
  "gitLikeJetbrain.sidebarMinVisibleColumns": 95
}
```

- `sidebarMaxWidth`: maximum sidebar width in px
- `sidebarMinVisibleColumns`: threshold for narrow-editor hiding

## Requirements

- Node.js 18+ (tested on Node 23)
- Git in `PATH`
- VSCode/Cursor compatible with `engines.vscode` in `package.json`

## Build VSIX

```bash
cd /Users/jinziguan/Desktop/git-like-jetbrain
npx @vscode/vsce package
```

Output example:

- `git-like-jetbrain-annotate-0.0.1.vsix`

## Install In VSCode

CLI:

```bash
code --install-extension /Users/jinziguan/Desktop/git-like-jetbrain/git-like-jetbrain-annotate-0.0.1.vsix --force
```

Or use Extensions panel -> `...` -> `Install from VSIX...`.

## Development

Run tests:

```bash
npm test
```

Debug:

1. Open repo in VSCode/Cursor.
2. Start extension host (`F5` in VSCode or equivalent in Cursor).
3. Open a Git-tracked file and use the line-number context menu.
