// src/app.js
require('dotenv').config();
const { App } = require('@slack/bolt');
const connectDb    = require('./db');
const addLeave     = require('./commands/addLeave');
const cancelLeave  = require('./commands/cancelLeave');
const queryLeave   = require('./commands/queryLeave');
const summaryLeave = require('./commands/summaryLeave');
const scheduler    = require('./scheduler');
const { isManager } = require('./utils/permissions');

// 1) Connect to MongoDB
connectDb()
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ DB error', err));

// 2) Initialize your Bolt App
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  port: process.env.PORT || 3000,
});

// Helper to route commands
function routeCommand(rawText, userId, say) {
  const textRaw = rawText.trim();
  const text = textRaw.toLowerCase();
  const context = { user: userId, text: textRaw };

  if (text.startsWith('add planned leave')) {
    return addLeave(context, say);
  }
  if (text.startsWith('cancel planned leave')) {
    return cancelLeave(context, say);
  }
  if (text.startsWith('query planned leave')) {
    return queryLeave(context, say);
  }
  if (text.startsWith('summary planned leave')) {
    if (!isManager(userId)) {
      return say('❌ You do not have permission to view the summary.');
    }
    return summaryLeave(context, say);
  }

  return say('Unknown command. Use `add/cancel/query/summary planned leave`');
}

// 3a) Handle channel @mentions
app.event('app_mention', async ({ event, say }) => {
  // strip the bot mention, pass the rest to the router
  const withoutMention = event.text.replace(/<@\w+>/, '');
  await routeCommand(withoutMention, event.user, say);
});

// 3b) Handle direct messages
app.message(async ({ message, say }) => {
  // ignore bot messages
  if (message.subtype === 'bot_message') return;

  // only handle DMs here
  if (message.channel_type === 'im') {
    await routeCommand(message.text, message.user, say);
  }
});

// 4) Start your app & scheduler
(async () => {
  await app.start();
  console.log('⚡️ Leave Tracker Bot is running');
  scheduler.start(app);
})();
