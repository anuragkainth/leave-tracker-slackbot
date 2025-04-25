const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);
function parseDates(input) {
  input = input.toLowerCase();
  // split by commas and spaces
  const parts = input.split(/[,]+/);
  const dates = [];
  parts.forEach(p => {
    p = p.trim();
    if (/\d+-\d+/.test(p)) {
      const [range, month] = p.split(/(?<=\d)(?=\D+)/);
      const [start,end] = range.split('-').map(n=>parseInt(n));
      for (let d = start; d <= end; d++) {
        const dt = dayjs(`${d} ${month}`, ['D MMM', 'D MMMM']);
        if (dt.isValid()) dates.push(dt.format('YYYY-MM-DD'));
      }
    } else {
      const dt = dayjs(p, ['D MMM', 'D MMMM', 'YYYY-MM-DD']);
      if (dt.isValid()) dates.push(dt.format('YYYY-MM-DD'));
    }
  });
  return Array.from(new Set(dates));
}
module.exports = { parseDates };