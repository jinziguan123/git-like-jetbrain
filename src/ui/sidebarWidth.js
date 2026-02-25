function clamp(value, min, max) {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

function getContentLength(rows) {
  let longest = 0;
  for (const row of rows) {
    const text = String(row.fullText || "");
    if (text.length > longest) {
      longest = text.length;
    }
  }
  return longest;
}

function estimateSidebarWidthPx(rows, options = {}) {
  const charWidthPx = Number.isFinite(options.charWidthPx) ? options.charWidthPx : 9;
  const horizontalPaddingPx = Number.isFinite(options.horizontalPaddingPx) ? options.horizontalPaddingPx : 16;
  const maxWidthPx = Number.isFinite(options.maxWidthPx) ? options.maxWidthPx : 200;
  const minWidthPx = Number.isFinite(options.minWidthPx) ? options.minWidthPx : 90;

  const longest = getContentLength(rows);
  const autoWidthPx = Math.ceil(longest * charWidthPx + horizontalPaddingPx);

  return clamp(autoWidthPx, minWidthPx, maxWidthPx);
}

function computeMaxCharsForWidth(widthPx, options = {}) {
  const charWidthPx = Number.isFinite(options.charWidthPx) ? options.charWidthPx : 9;
  const horizontalPaddingPx = Number.isFinite(options.horizontalPaddingPx) ? options.horizontalPaddingPx : 16;
  const usable = Math.max(0, widthPx - horizontalPaddingPx);
  return Math.max(1, Math.floor(usable / charWidthPx));
}

function fitTextToWidth(text, widthPx, options = {}) {
  const str = String(text || "");
  const maxChars = computeMaxCharsForWidth(widthPx, options);
  if (str.length <= maxChars) {
    return str;
  }
  if (maxChars <= 3) {
    return str.slice(0, maxChars);
  }
  return `${str.slice(0, maxChars - 3)}...`;
}

module.exports = {
  estimateSidebarWidthPx,
  fitTextToWidth,
  computeMaxCharsForWidth
};
