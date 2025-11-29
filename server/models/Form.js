const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema({
  questionKey: { type: String, required: true },
  operator: { type: String, required: true, enum: ['equals', 'notEquals', 'contains'] },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
});

const conditionalRulesSchema = new mongoose.Schema({
  logic: { type: String, required: true, enum: ['AND', 'OR'] },
  conditions: [conditionSchema]
});

const questionSchema = new mongoose.Schema({
  questionKey: { type: String, required: true },
  airtableFieldId: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, required: true, enum: ['shortText', 'longText', 'singleSelect', 'multiSelect', 'attachment'] },
  required: { type: Boolean, default: false },
  conditionalRules: conditionalRulesSchema
});

const formSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  airtableBaseId: { type: String, required: true },
  airtableTableId: { type: String, required: true },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Form', formSchema);