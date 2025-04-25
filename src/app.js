require('dotenv').config();
const { App } = require('@slack/bolt');
const connectDb = require('./db');
const addLeave = require('./commands/addLeave');
const cancelLeave = require('./commands/cancelLeave');
const queryLeave = require('./commands/queryLeave');
const scheduler = require('./scheduler');

// 1) Connect to MongoDB
connectDb()
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ DB error', err));

// 2) Initialize Bolt App
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  port: process.env.PORT || 3000,
});

// 3) Handle @mention commands
app.event('app_mention', async ({ event, say }) => {
  const text = event.text.replace(/<@\w+>/, '').trim().toLowerCase();
  if (text.startsWith('add planned leave'))    return addLeave(event, say);
  if (text.startsWith('cancel planned leave')) return cancelLeave(event, say);
  if (text.startsWith('query planned leave'))  return queryLeave(event, say);
  await say('Unknown command. Use `add/cancel/query planned leave`');
});

// 4) Start server + scheduler
(async () => {
  await app.start();
  console.log('⚡️ Leave Tracker Bot is running');
  scheduler.start(app);
})();
