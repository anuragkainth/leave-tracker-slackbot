// src/scheduler.js
const cron  = require('node-cron');
const dayjs = require('dayjs');
const Leave = require('./models/leave');

function formatSummary(records) {
  const byUser = {};
  records.forEach(r => {
    const uid = r.userId.slackId;
    byUser[uid] = byUser[uid] || [];
    byUser[uid].push(dayjs(r.date).format('YYYY-MM-DD'));
  });
  return Object.entries(byUser)
    .map(([uid, dates]) => `<@${uid}>: ${dates.join(', ')}`)
    .join('\n');
}

module.exports.start = (app) => {
  // Runs every day at 09:00 Asia/Kolkata time
  cron.schedule(
    '0 9 * * *',                        // minute hour dayOfMonth month dayOfWeek
    async () => {
      const today    = dayjs().startOf('day').toDate();
      const upcoming = dayjs().add(7, 'day').endOf('day').toDate();

      const records = await Leave.find({
        date:   { $gte: today, $lte: upcoming },
        status: 'planned',
      }).populate('userId', 'slackId');

      if (records.length) {
        await app.client.chat.postMessage({
          channel: process.env.SUMMARY_CHANNEL_ID,
          text:    '*Upcoming Leaves (Next 7 Days)*\n' + formatSummary(records),
        });
      }
    },
    {
      timezone: 'Asia/Kolkata'
    }
  );
};
