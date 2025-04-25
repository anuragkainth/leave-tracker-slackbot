const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

function parseDates(input) {
  const parts = input.split(/[,]+/);
  const dates = [];

  parts.forEach(p => {
    p = p.trim();
    // Handle ranges like "15-17 May"
    if (/\d+-\d+/.test(p)) {
      const [range, month] = p.split(/(?<=\d)(?=\D+)/);
      const [start,end] = range.split('-').map(n=>+n);
      for (let d = start; d <= end; d++) {
        const dt = dayjs(`${d} ${month}`, ['D MMM', 'D MMMM']);
        if (dt.isValid()) dates.push(dt.format('YYYY-MM-DD'));
      }
    } else {
      const dt = dayjs(p, ['D MMM', 'D MMMM', 'YYYY-MM-DD']);
      if (dt.isValid()) dates.push(dt.format('YYYY-MM-DD'));
    }
  });

  return [...new Set(dates)];
}

module.exports = { parseDates };
