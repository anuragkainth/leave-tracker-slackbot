const { Schema, model, Types } = require('mongoose');
const leaveSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true, index: true },
  status: { type: String, enum: ['planned','cancelled'], default: 'planned', index: true }
}, { timestamps: true });
leaveSchema.index({ date: 1, status: 1 });
module.exports = model('Leave', leaveSchema);