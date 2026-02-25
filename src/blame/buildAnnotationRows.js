const { parsePorcelain } = require("./parsePorcelain");
const { formatRelativeTime } = require("../time/formatRelativeTime");

function buildAnnotationRows(porcelain, nowSec) {
  return parsePorcelain(porcelain).map((item) => ({
    lineNumber: item.lineNumber,
    label: `${item.author} · ${formatRelativeTime(item.authorTime, nowSec)}`
  }));
}

module.exports = {
  buildAnnotationRows
};
