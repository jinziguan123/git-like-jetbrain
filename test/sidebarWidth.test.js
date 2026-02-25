const test = require("node:test");
const assert = require("node:assert/strict");

const {
  estimateSidebarWidthPx,
  fitTextToWidth,
  computeMaxCharsForWidth
} = require("../src/ui/sidebarWidth");

test("estimateSidebarWidthPx uses file longest text but caps at max width", () => {
  const rows = [
    { fullText: "2026/02/25 bob" },
    { fullText: "2026/02/25 very-very-very-long-author-name-for-demo" }
  ];
  const width = estimateSidebarWidthPx(rows, {
    maxWidthPx: 200,
    charWidthPx: 9,
    horizontalPaddingPx: 16
  });
  assert.equal(width, 200);
});

test("estimateSidebarWidthPx shrinks for short content", () => {
  const rows = [{ fullText: "2026/02/25 bob" }];
  const width = estimateSidebarWidthPx(rows, {
    maxWidthPx: 200,
    charWidthPx: 9,
    horizontalPaddingPx: 16
  });
  assert.equal(width < 200, true);
  assert.equal(width >= 90, true);
});

test("fitTextToWidth adds ellipsis when overflow", () => {
  const width = 120;
  const maxChars = computeMaxCharsForWidth(width, {
    charWidthPx: 9,
    horizontalPaddingPx: 16
  });
  const fitted = fitTextToWidth("2026/02/25 very-very-very-long-author-name", width, {
    charWidthPx: 9,
    horizontalPaddingPx: 16
  });
  assert.equal(fitted.length <= maxChars, true);
  assert.equal(fitted.endsWith("..."), true);
});

test("fitTextToWidth keeps content when width is enough", () => {
  const text = "2026/02/25 bob";
  const fitted = fitTextToWidth(text, 220, {
    charWidthPx: 9,
    horizontalPaddingPx: 16
  });
  assert.equal(fitted, text);
});
