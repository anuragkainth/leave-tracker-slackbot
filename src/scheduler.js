const cron = require('node-cron');
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
  cron.schedule('*/2 * * * *', async () => {
    const today = dayjs().startOf('day');
    const upcoming = today.add(7, 'day');
    const records = await Leave.find({
      date: { $gte: today.toDate(), $lte: upcoming.toDate() },
      status: 'planned',
    }).populate('userId', 'slackId');

    if (records.length) {
      await app.client.chat.postMessage({
        channel: process.env.SUMMARY_CHANNEL_ID,
        text: '*Upcoming Leaves (Next 7 Days)*\n' + formatSummary(records),
      });
    }
  });
};
