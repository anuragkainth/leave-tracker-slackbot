const Leave = require('../models/leave');
const { parseDates } = require('../utils/dateParser');
const dayjs = require('dayjs');

module.exports = async (event, say) => {
  const slackId = event.user;
  const dates   = parseDates(event.text);
  if (!dates.length) return say('No valid dates to cancel.');

  const msgs = [];
  for (const iso of dates) {
    const dt = dayjs(iso);
    const rec = await Leave.findOne({ date: dt.toDate(), status: 'planned' })
                           .populate('userId');
    if (!rec) {
      msgs.push(`No planned leave on ${iso}`);
    } else if (rec.userId.slackId !== slackId) {
      msgs.push(`Cannot cancel ${iso}: not your leave`);
    } else {
      rec.status = 'cancelled';
      await rec.save();
      msgs.push(`Cancelled ${iso}`);
    }
  }

  return say(msgs.join('\n'));
};
