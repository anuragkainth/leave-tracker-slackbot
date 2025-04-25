require('dotenv').config();
const { App } = require('@slack/bolt');
const connectDb = require('./db');
const addLeave = require('./commands/addLeave');
const cancelLeave = require('./commands/cancelLeave');
const queryLeave = require('./commands/queryLeave');
const scheduler = require('./scheduler');

// Connect to MongoDB
connectDb()
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ DB error', err));

// Initialize Slack App
const app = new App({ token: process.env.SLACK_BOT_TOKEN, signingSecret: process.env.SLACK_SIGNING_SECRET });

// Listen for mentions
app.event('app_mention', async ({ event, say }) => {
  const text = event.text.replace(/<@\w+>/, '').trim().toLowerCase();
  if (text.startsWith('add planned leave')) return addLeave(event, say);
  if (text.startsWith('cancel planned leave')) return cancelLeave(event, say);
  if (text.startsWith('query planned leave')) return queryLeave(event, say);
  await say('Unknown command. Try `add/cancel/query planned leave`');
});

// Start app + scheduler
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bot up');
  scheduler.start(app);
})();