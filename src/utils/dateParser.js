const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

function normalizeToken(token) {
  token = token.trim().toLowerCase();
  // Remove any Slack mention tags
  token = token.replace(/<@[^>]+>/g, '').trim();
  // Insert space if missing between digit and letter, e.g. "29may"
  token = token.replace(/(\d)([a-z])/gi, '$1 $2');
  // Capitalize month words
  MONTHS.forEach(mon => {
    const lc = mon.toLowerCase();
    token = token.replace(new RegExp(`\\b${lc}\\b`, 'i'), mon);
  });
  return token;
}

function parseDates(input) {
  // Remove the command phrase if present
  input = input.replace(/^(add|cancel|query)?\s*planned\s*leave(?:\s*on)?/i, '').trim();
  // Split on commas or the word "and"
  const parts = input.split(/\s*(?:,|and)\s*/i);
  const dates = new Set();

  parts.forEach(raw => {
    if (!raw) return;
    const token = normalizeToken(raw);

    // Range support: "15-17 May" or "15–17 May"
    const rangeMatch = token.match(/^(\d{1,2})\s*[-–]\s*(\d{1,2})\s+([A-Za-z]+)$/);
    if (rangeMatch) {
      const [, start, end, month] = rangeMatch;
      for (let d = +start; d <= +end; d++) {
        const txt = `${d} ${month}`;
        const dt = dayjs(txt, ['D MMM', 'D MMMM', 'YYYY-MM-DD'], true);
        if (dt.isValid()) dates.add(dt.format('YYYY-MM-DD'));
      }
      return;
    }

    // Single date
    const dt = dayjs(token, ['D MMM', 'D MMMM', 'YYYY-MM-DD'], true);
    if (dt.isValid()) {
      dates.add(dt.format('YYYY-MM-DD'));
    }
  });

  return Array.from(dates).sort();
}

module.exports = { parseDates };
