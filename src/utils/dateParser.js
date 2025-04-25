const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

// Map to normalize month names to proper casing
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

// Given a raw token like "29may" or "5 june", normalize to e.g. "29 May"
function normalizeToken(token) {
  token = token.trim().toLowerCase();
  // Insert space between number and letter if missing: "29may" → "29 may"
  token = token.replace(/(\d)([a-z])/gi, '$1 $2');
  // Capitalize month word
  MONTHS.forEach(mon => {
    const lc = mon.toLowerCase();
    const re = new RegExp(`\\b${lc}\\b`, 'i');
    token = token.replace(re, mon);
  });
  return token;
}

function parseDates(input) {
  // Remove any leading command words
  input = input.replace(/^(add|cancel|query)?\s*planned\s*leave\s*(on\s*)?/i, '').trim();
  // Split by comma, ' and ', or whitespace around 'and'
  const parts = input.split(/\s*(?:,|and)\s*/i);
  const dates = new Set();

  parts.forEach(raw => {
    if (!raw) return;
    const token = normalizeToken(raw);

    // Handle ranges like "15-17 May" or "15–17 May"
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
