// src/commands/summaryLeave.js

const Leave = require('../models/leave');
const dayjs = require('dayjs');
const { isManager } = require('../utils/permissions');

async function getSummaryLines() {
  const today    = dayjs().startOf('day').toDate();
  const upcoming = dayjs().add(7, 'day').endOf('day').toDate();

  const records = await Leave.find({
    date:   { $gte: today, $lte: upcoming },
    status: 'planned',
  }).populate('userId', 'slackId');

  const byUser = {};
  records.forEach(r => {
    const uid = r.userId.slackId;
    byUser[uid] = byUser[uid] || [];
    byUser[uid].push(dayjs(r.date).format('YYYY-MM-DD'));
  });

  return Object.entries(byUser).map(
    ([slackId, dates]) => `<@${slackId}>: ${dates.join(', ')}`
  );
}

module.exports = async (event, say) => {
  // 1) Permission guard
  if (!isManager(event.user)) {
    return say('❌ You do not have permission to view the summary.');
  }

  // 2) Build and send summary
  const lines = await getSummaryLines();
  if (!lines.length) {
    return say('No one is scheduled for leave in the next 7 days.');
  }

  const header = '*Upcoming Leaves (Next 7 Days)*';
  await say([header, ...lines].join('\n'));
};
