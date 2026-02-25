# Git Like JetBrains Annotate（中文说明）

这是一个可用于 VSCode/Cursor 的扩展，提供类似 JetBrains `Annotate with Git Blame` 的能力：在每一行代码末尾显示该行最近一次提交的作者与相对时间。

## 功能特性

- 在代码行号区域右键菜单提供：
  - `Annotate with Git Blame`（开启注释）
  - `Hide Git Blame Annotation`（关闭注释）
  - `Refresh Git Blame Annotation`（手动刷新）
- 行尾显示格式：`作者 · 相对时间`
- 作用范围：仅当前文件
- 自动刷新触发：
  - 保存文件时
  - 切回该编辑器时
  - 轮询检测到 Git HEAD 变化时（例如切分支或 pull 后）

## 环境要求

- Node.js 18+
- 本机已安装 Git，并且可通过 `git` 命令调用
- VSCode / Cursor 版本与 `package.json` 的 `engines.vscode` 兼容

## 本地开发调试（VSCode）

1. 用 VSCode 打开仓库根目录。
2. 按 `F5` 启动扩展调试（会打开一个 Extension Development Host 窗口）。
3. 在新窗口中打开一个 Git 仓库里的代码文件。
4. 右键点击行号，选择 `Annotate with Git Blame`。
5. 需要关闭时，右键点击行号，选择 `Hide Git Blame Annotation`。

## 本地开发调试（Cursor）

Cursor 与 VSCode 扩展机制兼容，调试步骤基本一致：

1. 用 Cursor 打开本仓库。
2. 启动 Run/Debug，进入扩展宿主窗口。
3. 在宿主窗口中打开 Git 跟踪文件，右键行号触发命令。

## 测试命令

```bash
npm test
```

## 如何打包成 VSIX

推荐使用 `@vscode/vsce`（新版包名）进行打包。

### 方式 A：直接用 npx（无需全局安装）

```bash
cd /Users/jinziguan/Desktop/git-like-jetbrain
npx @vscode/vsce package
```

执行成功后，会在当前目录生成类似下面的文件：

`git-like-jetbrain-annotate-0.0.1.vsix`

### 方式 B：全局安装后再打包

```bash
npm install -g @vscode/vsce
cd /Users/jinziguan/Desktop/git-like-jetbrain
vsce package
```

## 如何安装到 VSCode

拿到 `.vsix` 文件后，你可以任选一种安装方式。

### 方式 A：命令行安装（推荐）

```bash
code --install-extension /Users/jinziguan/Desktop/git-like-jetbrain/git-like-jetbrain-annotate-0.0.1.vsix
```

如果你的命令是 `code-insiders`，就把 `code` 替换为 `code-insiders`。

### 方式 B：VSCode 图形界面安装

1. 打开 VSCode。
2. 进入扩展面板。
3. 右上角 `...` 菜单。
4. 选择 `Install from VSIX...`。
5. 选择你打包出来的 `.vsix` 文件。

## 安装后使用

1. 打开任意 Git 仓库中的文件。
2. 右键点击某一行的行号。
3. 点击 `Annotate with Git Blame` 开启。
4. 右键行号点击 `Hide Git Blame Annotation` 关闭。

## 常见问题

- 看不到右键菜单项：
  - 请确认当前是文件编辑器（不是 diff/只读特殊视图）。
  - 请确认文件位于本地文件系统（`file://`）。
- 开启后没有显示内容：
  - 请确认该文件在 Git 仓库内，并且可执行 `git blame`。
  - 可先保存文件，再使用 `Refresh Git Blame Annotation`。
- 打包命令卡住或失败：
  - 常见原因是网络环境导致 `npx` 下载慢，可先全局安装 `@vscode/vsce` 再执行打包。
