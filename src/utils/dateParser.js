// src/utils/dateParser.js
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

// Full month names
const MONTHS = {
  january:   'January', february: 'February', march:   'March',
  april:     'April',   may:      'May',      june:    'June',
  july:      'July',    august:   'August',   september:'September',
  october:   'October', november: 'November', december:'December'
};

// Abbrev map (including 'sept')
const ABBR = {
  jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr',
  may: 'May', jun: 'Jun', jul: 'Jul', aug: 'Aug',
  sep: 'Sep', sept: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec'
};

function normalizeToken(token) {
  token = token.trim().toLowerCase();
  token = token.replace(/<@[^>]+>/g, '').trim();          // strip mentions
  token = token.replace(/(\d)([a-z])/gi, '$1 $2');         // '29may' -> '29 may'

  // fix abbreviations
  Object.entries(ABBR).forEach(([k,v]) => {
    const re = new RegExp(`\\b${k}\\b`, 'i');
    token = token.replace(re, v);
  });

  // fix full month names to Title Case
  Object.entries(MONTHS).forEach(([k,v]) => {
    const re = new RegExp(`\\b${k}\\b`, 'i');
    token = token.replace(re, v);
  });

  return token;
}

function parseDates(input) {
  // strip leading command words
  input = input.replace(/^(add|cancel|query)?\s*planned\s*leave(?:\s*on)?/i, '').trim();
  if (!input) return [];

  // split on commas or 'and'
  const parts = input.split(/\s*(?:,|and)\s*/i);
  const dates = new Set();

  parts.forEach(raw => {
    if (!raw) return;
    const token = normalizeToken(raw);

    // range e.g. "15-17 May"
    const m = token.match(/^(\d{1,2})\s*[-–]\s*(\d{1,2})\s+([A-Za-z]+)$/);
    if (m) {
      const [ , start, end, month ] = m;
      for (let d = +start; d <= +end; d++) {
        const txt = `${d} ${month}`;
        const dt = dayjs(txt, ['D MMM', 'D MMMM', 'YYYY-MM-DD'], true);
        if (dt.isValid()) dates.add(dt.format('YYYY-MM-DD'));
      }
      return;
    }

    // single date
    const dt = dayjs(token, ['D MMM', 'D MMMM', 'YYYY-MM-DD'], true);
    if (dt.isValid()) {
      dates.add(dt.format('YYYY-MM-DD'));
    }
  });

  return Array.from(dates).sort();
}

module.exports = { parseDates };
