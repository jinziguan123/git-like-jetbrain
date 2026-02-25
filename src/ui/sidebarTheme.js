function clamp01(value) {
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

function lerp(start, end, t) {
  return Math.round(start + (end - start) * t);
}

function lerpAlpha(start, end, t) {
  return (start + (end - start) * t).toFixed(2);
}

function rgba(r, g, b, a) {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function buildBlueSidebarColors(ageRatio) {
  const t = clamp01(ageRatio);

  const bgR = lerp(147, 30, t);
  const bgG = lerp(197, 64, t);
  const bgB = lerp(253, 175, t);
  const bgA = lerpAlpha(0.18, 0.42, t);

  const fgR = lerp(191, 239, t);
  const fgG = lerp(219, 246, t);
  const fgB = lerp(254, 255, t);
  const fgA = lerpAlpha(0.86, 0.98, t);

  return {
    background: rgba(bgR, bgG, bgB, bgA),
    foreground: rgba(fgR, fgG, fgB, fgA)
  };
}

module.exports = {
  buildBlueSidebarColors
};
