const test = require("node:test");
const assert = require("node:assert/strict");

const { AnnotationStore } = require("../src/state/AnnotationStore");

test("AnnotationStore toggles state per file URI", () => {
  const store = new AnnotationStore();
  const a = "file:///a.ts";
  const b = "file:///b.ts";

  assert.equal(store.isEnabled(a), false);
  assert.equal(store.toggle(a), true);
  assert.equal(store.isEnabled(a), true);
  assert.equal(store.isEnabled(b), false);
  assert.equal(store.toggle(a), false);
  assert.equal(store.isEnabled(a), false);
});
