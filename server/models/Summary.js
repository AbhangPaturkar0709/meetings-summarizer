const mongoose = require('mongoose');

const SummarySchema = new mongoose.Schema({
  transcript: String,
  prompt: String,
  generated: String,   // raw AI response
  edited: String,      // user-edited final text
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('Summary', SummarySchema);
