const Leave = require('../models/leave');
const User = require('../models/user');
const { isManager } = require('../utils/permissions');
const dayjs = require('dayjs');
module.exports = async (event, say) => {
  let target = event.user;
  const m = event.text.match(/for <@(\w+)>/);
  if (m) {
    if (!isManager(event.user)) return say('No permission.');
    target = m[1];
  }
  const user = await User.findOne({ slackId: target });
  if (!user) return say('No records.');
  const recs = await Leave.find({ userId: user._id, status: 'planned', date: { $gte: dayjs().toDate() } }).sort('date');
  if (!recs.length) return say('No upcoming leaves.');
  say(`Upcoming leaves for <@${target}>:\n${recs.map(r=>dayjs(r.date).format('YYYY-MM-DD')).join(', ')}`);
};