const Leave = require('../models/leave');
const User  = require('../models/user');
const { parseDates } = require('../utils/dateParser');
const dayjs = require('dayjs');

module.exports = async (event, say) => {
  const slackId = event.user;
  const dates = parseDates(
    event.text.replace(/add planned leave/i, '')
  );
  if (!dates.length) return say('No valid dates found.');

  const user = await User.findOneAndUpdate(
    { slackId },
    { slackId },
    { upsert: true, new: true }
  );

  const msgs = [];
  for (const iso of dates) {
    const d = dayjs(iso);
    if (d.isBefore(dayjs(), 'day')) {
      msgs.push(`Skipped past ${iso}`);
      continue;
    }
    const exist = await Leave.findOne({
      userId: user._id,
      date: d.toDate(),
      status: 'planned'
    });
    if (exist) msgs.push(`Already planned ${iso}`);
    else {
      await Leave.create({ userId: user._id, date: d.toDate() });
      msgs.push(`Added ${iso}`);
    }
  }

  say(msgs.join('\n'));
};
