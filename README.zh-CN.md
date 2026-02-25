# Git Like JetBrains Annotate（中文说明）

这是一个可用于 VSCode/Cursor 的扩展，目标是提供接近 JetBrains 的 `Annotate with Git Blame` 体验。

## 当前实现效果

- 注释显示在**代码左侧独立栏**（不是行尾）。
- 每行显示格式：`YYYY/MM/DD 作者`。
- 颜色按提交时间新旧做蓝色渐变：
  - 越新越浅蓝
  - 越旧越深蓝
- 作用范围：仅当前文件。
- 宽度策略：
  - 根据当前文件最长注释内容自动计算
  - 受最大宽度限制（`gitLikeJetbrain.sidebarMaxWidth`，默认 `200`）
  - 超出部分使用 `...` 省略

## 右键菜单行为

在行号区域右键可见：

- `Annotate with Git Blame`
- `Hide Git Blame Annotation`
- `Refresh Git Blame Annotation`

如果当前文件不在 Git 仓库中，会显示禁用态菜单项：

- `Annotate with Git Blame (File Not In Git Repository)`

## 刷新与可见性

自动刷新触发场景：

- 保存文件
- 切换活动编辑器
- 可见范围变化
- 扩展配置变化
- 轮询检测到 Git HEAD 变化

当编辑器确实过窄（并且能证明存在水平裁剪）时，会暂时隐藏侧栏；恢复布局后刷新即可重现。

## 配置项

```json
{
  "gitLikeJetbrain.sidebarMaxWidth": 200,
  "gitLikeJetbrain.sidebarMinVisibleColumns": 95
}
```

- `sidebarMaxWidth`：侧栏最大宽度（px）
- `sidebarMinVisibleColumns`：窄编辑器隐藏阈值

## 环境要求

- Node.js 18+
- 本机可执行 `git`
- VSCode/Cursor 与 `package.json` 的 `engines.vscode` 兼容

## 打包 VSIX

```bash
cd /Users/jinziguan/Desktop/git-like-jetbrain
npx @vscode/vsce package
```

输出示例：

- `git-like-jetbrain-annotate-0.0.1.vsix`

## 安装到 VSCode

命令行安装（推荐）：

```bash
code --install-extension /Users/jinziguan/Desktop/git-like-jetbrain/git-like-jetbrain-annotate-0.0.1.vsix --force
```

也可以在 VSCode 扩展面板 `... -> Install from VSIX...` 选择安装。

## 开发与测试

运行测试：

```bash
npm test
```

调试步骤：

1. 在 VSCode/Cursor 打开仓库。
2. 启动扩展调试（VSCode 默认 `F5`）。
3. 在扩展宿主窗口打开 Git 文件，右键行号触发命令。
