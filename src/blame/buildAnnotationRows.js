const { parsePorcelain } = require("./parsePorcelain");

function formatDateYmd(authorTime) {
  if (!authorTime || authorTime <= 0) {
    return "----/--/--";
  }
  const date = new Date(authorTime * 1000);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

function calcAgeRatio(authorTime, minTime, maxTime) {
  if (maxTime <= minTime) {
    return 0.5;
  }
  const ratio = (maxTime - authorTime) / (maxTime - minTime);
  if (ratio < 0) {
    return 0;
  }
  if (ratio > 1) {
    return 1;
  }
  return ratio;
}

function buildAnnotationRows(porcelain) {
  const lines = parsePorcelain(porcelain);
  if (lines.length === 0) {
    return [];
  }

  const times = lines.map((item) => item.authorTime || 0);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  return lines.map((item) => {
    const dateText = formatDateYmd(item.authorTime);
    const rawText = `${dateText} ${item.author}`.trim();
    return {
      lineNumber: item.lineNumber,
      author: item.author,
      authorTime: item.authorTime,
      dateText,
      fullText: rawText,
      ageRatio: calcAgeRatio(item.authorTime, minTime, maxTime)
    };
  });
}

module.exports = {
  buildAnnotationRows,
  formatDateYmd,
  calcAgeRatio
};
