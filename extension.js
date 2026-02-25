const vscode = require("vscode");
const { AnnotationStore } = require("./src/state/AnnotationStore");
const { BlameDecorationRenderer } = require("./src/ui/BlameDecorationRenderer");
const { getFileBlamePorcelain, getHeadCommit } = require("./src/git/gitClient");
const { buildAnnotationRows } = require("./src/blame/buildAnnotationRows");

const CONTEXT_KEY = "gitLikeJetbrain.annotateEnabled";
const POLL_MS = 4000;
const REFRESH_DEBOUNCE_MS = 500;

function activate(context) {
  const store = new AnnotationStore();
  const renderer = new BlameDecorationRenderer(vscode);

  const repoHeadCache = new Map();
  const fileRepoCache = new Map();
  const pendingRefresh = new Map();
  const sidebarHiddenByUri = new Set();
  let pollBusy = false;

  function readRenderConfig() {
    const config = vscode.workspace.getConfiguration("gitLikeJetbrain");
    const sidebarWidth = Number(config.get("sidebarWidth", 220));
    const sidebarMaxChars = Number(config.get("sidebarMaxChars", 24));
    const sidebarMinVisibleColumns = Number(config.get("sidebarMinVisibleColumns", 95));
    return {
      sidebarWidth: Number.isFinite(sidebarWidth) ? Math.max(120, Math.min(360, Math.round(sidebarWidth))) : 220,
      sidebarMaxChars: Number.isFinite(sidebarMaxChars)
        ? Math.max(14, Math.min(64, Math.round(sidebarMaxChars)))
        : 24,
      sidebarMinVisibleColumns: Number.isFinite(sidebarMinVisibleColumns)
        ? Math.max(40, Math.min(200, Math.round(sidebarMinVisibleColumns)))
        : 95
    };
  }

  async function updateContextForActiveEditor() {
    const editor = vscode.window.activeTextEditor;
    const enabled = Boolean(editor && store.isEnabled(editor.document.uri.toString()));
    await vscode.commands.executeCommand("setContext", CONTEXT_KEY, enabled);
  }

  function getActiveFileEditor() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.uri.scheme !== "file") {
      return null;
    }
    return editor;
  }

  async function refreshEditor(editor, reason) {
    const uri = editor.document.uri.toString();
    if (!store.isEnabled(uri)) {
      renderer.clear(editor);
      return;
    }

    try {
      const renderConfig = readRenderConfig();
      const { repoRoot, porcelain } = await getFileBlamePorcelain(editor.document.uri.fsPath);
      fileRepoCache.set(uri, repoRoot);
      const rows = buildAnnotationRows(porcelain, {
        maxChars: renderConfig.sidebarMaxChars
      });
      const renderResult = renderer.render(editor, rows, {
        sidebarWidth: renderConfig.sidebarWidth,
        minVisibleColumns: renderConfig.sidebarMinVisibleColumns
      });
      if (renderResult.hidden) {
        if (!sidebarHiddenByUri.has(uri)) {
          sidebarHiddenByUri.add(uri);
          vscode.window.showInformationMessage(
            "Git blame sidebar hidden on narrow editor width."
          );
        }
      } else {
        sidebarHiddenByUri.delete(uri);
      }
      const head = await getHeadCommit(repoRoot);
      repoHeadCache.set(repoRoot, head);
    } catch (error) {
      const message = error && error.message ? error.message : String(error);
      if (reason === "annotate") {
        vscode.window.showWarningMessage(`Git blame unavailable: ${message}`);
      }
      sidebarHiddenByUri.delete(uri);
      renderer.clear(editor);
    }
  }

  function scheduleRefresh(editor, reason) {
    const uri = editor.document.uri.toString();
    const prev = pendingRefresh.get(uri);
    if (prev) {
      clearTimeout(prev);
    }
    const timer = setTimeout(() => {
      pendingRefresh.delete(uri);
      refreshEditor(editor, reason);
    }, REFRESH_DEBOUNCE_MS);
    pendingRefresh.set(uri, timer);
  }

  async function runAnnotate() {
    const editor = getActiveFileEditor();
    if (!editor) {
      return;
    }
    const uri = editor.document.uri.toString();
    store.enable(uri);
    await updateContextForActiveEditor();
    await refreshEditor(editor, "annotate");
  }

  async function runHide() {
    const editor = getActiveFileEditor();
    if (!editor) {
      return;
    }
    const uri = editor.document.uri.toString();
    store.disable(uri);
    sidebarHiddenByUri.delete(uri);
    renderer.clear(editor);
    await updateContextForActiveEditor();
  }

  async function runRefresh() {
    const editor = getActiveFileEditor();
    if (!editor) {
      return;
    }
    const uri = editor.document.uri.toString();
    if (!store.isEnabled(uri)) {
      return;
    }
    scheduleRefresh(editor, "manual");
  }

  async function pollRepoHeadChanges() {
    if (pollBusy) {
      return;
    }
    pollBusy = true;
    try {
      const enabledUris = store.listEnabledUris();
      for (const uriString of enabledUris) {
        const repoRoot = fileRepoCache.get(uriString);
        if (!repoRoot) {
          continue;
        }
        let nextHead;
        try {
          nextHead = await getHeadCommit(repoRoot);
        } catch (error) {
          continue;
        }
        const prevHead = repoHeadCache.get(repoRoot);
        if (prevHead && prevHead !== nextHead) {
          for (const editor of vscode.window.visibleTextEditors) {
            const editorUri = editor.document.uri.toString();
            if (!store.isEnabled(editorUri)) {
              continue;
            }
            if (fileRepoCache.get(editorUri) === repoRoot) {
              scheduleRefresh(editor, "head-change");
            }
          }
        }
        repoHeadCache.set(repoRoot, nextHead);
      }
    } finally {
      pollBusy = false;
    }
  }

  context.subscriptions.push(
    renderer,
    vscode.commands.registerCommand("gitLikeJetbrain.annotate", runAnnotate),
    vscode.commands.registerCommand("gitLikeJetbrain.hideAnnotate", runHide),
    vscode.commands.registerCommand("gitLikeJetbrain.refreshAnnotate", runRefresh),
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (doc.uri.scheme !== "file") {
        return;
      }
      for (const editor of vscode.window.visibleTextEditors) {
        if (editor.document.uri.toString() !== doc.uri.toString()) {
          continue;
        }
        if (!store.isEnabled(doc.uri.toString())) {
          continue;
        }
        scheduleRefresh(editor, "save");
      }
    }),
    vscode.workspace.onDidCloseTextDocument((doc) => {
      const uri = doc.uri.toString();
      store.disable(uri);
      sidebarHiddenByUri.delete(uri);
      fileRepoCache.delete(uri);
      const pending = pendingRefresh.get(uri);
      if (pending) {
        clearTimeout(pending);
        pendingRefresh.delete(uri);
      }
      if (vscode.window.activeTextEditor?.document.uri.toString() === uri) {
        updateContextForActiveEditor();
      }
    }),
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      updateContextForActiveEditor();
      if (!editor || editor.document.uri.scheme !== "file") {
        return;
      }
      if (store.isEnabled(editor.document.uri.toString())) {
        scheduleRefresh(editor, "active-editor");
      }
    }),
    vscode.window.onDidChangeTextEditorVisibleRanges((event) => {
      const editor = event.textEditor;
      const uri = editor.document.uri.toString();
      if (!store.isEnabled(uri)) {
        return;
      }
      scheduleRefresh(editor, "visible-range");
    }),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration("gitLikeJetbrain")) {
        return;
      }
      for (const editor of vscode.window.visibleTextEditors) {
        const uri = editor.document.uri.toString();
        if (!store.isEnabled(uri)) {
          continue;
        }
        scheduleRefresh(editor, "config-change");
      }
    })
  );

  const interval = setInterval(() => {
    pollRepoHeadChanges();
  }, POLL_MS);
  context.subscriptions.push({
    dispose: () => clearInterval(interval)
  });

  updateContextForActiveEditor();
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
