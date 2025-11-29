const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  airtableRecordId: { type: String, required: true },
  answers: { type: Object, required: true }, // JSON object of answers
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedInAirtable: { type: Boolean, default: false }
});

module.exports = mongoose.model('Response', responseSchema);