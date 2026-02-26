function parsePorcelain(raw) {
  const result = [];
  const lines = String(raw || "").split("\n");

  let currentLineNumber = null;
  let currentRevision = "";
  let currentAuthor = "Unknown";
  let currentAuthorTime = 0;

  for (const line of lines) {
    if (/^[0-9a-f]{7,40}\s+\d+\s+\d+(?:\s+\d+)?$/.test(line)) {
      const parts = line.split(/\s+/);
      currentRevision = parts[0];
      currentLineNumber = Number.parseInt(parts[2], 10);
      currentAuthor = "Unknown";
      currentAuthorTime = 0;
      continue;
    }

    if (line.startsWith("author ")) {
      currentAuthor = line.slice("author ".length);
      continue;
    }

    if (line.startsWith("author-time ")) {
      currentAuthorTime = Number.parseInt(line.slice("author-time ".length), 10) || 0;
      continue;
    }

    if (line.startsWith("\t") && Number.isInteger(currentLineNumber)) {
      result.push({
        revision: currentRevision,
        lineNumber: currentLineNumber,
        author: currentAuthor,
        authorTime: currentAuthorTime
      });
    }
  }

  return result;
}

module.exports = {
  parsePorcelain
};
