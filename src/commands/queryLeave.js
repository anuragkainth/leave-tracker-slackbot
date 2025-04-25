const Leave = require('../models/leave');
const User  = require('../models/user');
const { isManager } = require('../utils/permissions');
const dayjs = require('dayjs');

module.exports = async (event, say) => {
  let target = event.user;
  const m = event.text.match(/for <@(\w+)>/);
  if (m) {
    if (!isManager(event.user)) return say('You do not have permission to query others.');
    target = m[1];
  }

  const user = await User.findOne({ slackId: target });
  if (!user) return say('No leave records found.');
  
  const recs = await Leave.find({
    userId: user._id,
    status: 'planned',
    date: { $gte: dayjs().toDate() }
  }).sort('date');

  if (!recs.length) return say(`No upcoming leaves for <@${target}>.`);
  
  const list = recs.map(r => dayjs(r.date).format('YYYY-MM-DD')).join(', ');
  say(`Upcoming leaves for <@${target}>:\n${list}`);
};
