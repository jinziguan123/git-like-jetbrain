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

  assert.ok(menuIds.includes("gitLikeJetbrain.annotate"));
  assert.ok(menuIds.includes("gitLikeJetbrain.hideAnnotate"));
  assert.ok(menuIds.includes("gitLikeJetbrain.refreshAnnotate"));
});
