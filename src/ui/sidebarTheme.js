function clamp01(value) {
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

const BACKGROUND_STEPS = [
  "rgba(90, 144, 245, 0.62)",
  "rgba(75, 127, 220, 0.53)",
  "rgba(58, 108, 193, 0.45)",
  "rgba(43, 87, 160, 0.38)",
  "rgba(31, 67, 128, 0.32)"
];

const UNIFIED_FOREGROUND = "rgba(230, 236, 245, 0.96)";

function toBucketIndex(ageRatio) {
  const t = clamp01(ageRatio);
  const accentRatio = Math.pow(t, 1.35);
  const raw = Math.floor(accentRatio * BACKGROUND_STEPS.length);
  if (raw < 0) {
    return 0;
  }
  if (raw >= BACKGROUND_STEPS.length) {
    return BACKGROUND_STEPS.length - 1;
  }
  return raw;
}

function buildBlueSidebarColors(ageRatio) {
  const bucket = toBucketIndex(ageRatio);

  return {
    background: BACKGROUND_STEPS[bucket],
    foreground: UNIFIED_FOREGROUND
  };
}

module.exports = {
  buildBlueSidebarColors,
  toBucketIndex
};
