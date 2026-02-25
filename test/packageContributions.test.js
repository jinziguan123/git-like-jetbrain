const test = require("node:test");
const assert = require("node:assert/strict");

const manifest = require("../package.json");

test("package contributes line number context commands", () => {
  const commands = manifest.contributes?.commands ?? [];
  const menus = manifest.contributes?.menus?.["editor/lineNumber/context"] ?? [];

  const commandIds = commands.map((item) => item.command);
  const menuIds = menus.map((item) => item.command);

  assert.ok(commandIds.includes("gitLikeJetbrain.annotate"));
  assert.ok(commandIds.includes("gitLikeJetbrain.hideAnnotate"));
  assert.ok(commandIds.includes("gitLikeJetbrain.refreshAnnotate"));
  assert.ok(commandIds.includes("gitLikeJetbrain.annotateUnavailable"));

  assert.ok(menuIds.includes("gitLikeJetbrain.annotate"));
  assert.ok(menuIds.includes("gitLikeJetbrain.hideAnnotate"));
  assert.ok(menuIds.includes("gitLikeJetbrain.refreshAnnotate"));
  assert.ok(menuIds.includes("gitLikeJetbrain.annotateUnavailable"));
});

test("line number menu visibility should not depend on editor focus timing", () => {
  const menus = manifest.contributes?.menus?.["editor/lineNumber/context"] ?? [];
  for (const item of menus) {
    const when = String(item.when || "");
    assert.equal(when.includes("editorTextFocus"), false);
  }
});

test("annotate unavailable command is disabled in menus", () => {
  const commands = manifest.contributes?.commands ?? [];
  const unavailable = commands.find((item) => item.command === "gitLikeJetbrain.annotateUnavailable");
  assert.ok(unavailable);
  assert.equal(unavailable.enablement, "false");
});

test("extension activates on startup so git availability context can be computed before first menu open", () => {
  const events = manifest.activationEvents ?? [];
  assert.ok(events.includes("onStartupFinished"));
});
