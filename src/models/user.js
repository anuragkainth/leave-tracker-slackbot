const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  slackId: { type: String, required: true, unique: true, index: true },
  realName: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = model('User', userSchema);
