const Leave = require('../models/leave');
const { parseDates } = require('../utils/dateParser');
const dayjs = require('dayjs');
module.exports = async (event, say) => {
  const slackId = event.user;
  const dates = parseDates(event.text.replace(/cancel planned leave on/i, ''));
  if (dates.length !== 1) return say('Specify exactly one date.');
  const dt = dayjs(dates[0]);
  const rec = await Leave.findOne({ date: dt.toDate(), status: 'planned' }).populate('userId');
  if (!rec || rec.userId.slackId !== slackId) return say(`No planned leave on ${dates[0]}`);
  rec.status = 'cancelled'; await rec.save();
  say(`Cancelled ${dates[0]}`);
};