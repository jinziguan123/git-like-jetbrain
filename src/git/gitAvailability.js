function createGitAvailabilityChecker({ getRepoRootFn, nowFn = () => Date.now(), ttlMs = 3000 }) {
  const cache = new Map();

  return async function isGitFile(filePath) {
    if (!filePath) {
      return false;
    }

    const now = nowFn();
    const hit = cache.get(filePath);
    if (hit && now - hit.at <= ttlMs) {
      return hit.ok;
    }

    let ok = false;
    try {
      await getRepoRootFn(filePath);
      ok = true;
    } catch (error) {
      ok = false;
    }

    cache.set(filePath, { ok, at: now });
    return ok;
  };
}

module.exports = {
  createGitAvailabilityChecker
};
