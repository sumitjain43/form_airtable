const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const Form = require('../models/Form');
const Response = require('../models/Response');

const router = express.Router();

// Middleware to get user
const getUser = async (req, res, next) => {
  const userId = req.headers['user-id'];
  if (!userId) return res.status(401).send('User not authenticated');
  const user = await User.findById(userId);
  if (!user) return res.status(401).send('User not found');
  req.user = user;
  next();
};

// GET /bases
router.get('/bases', getUser, async (req, res) => {
  try {
    const response = await axios.get('https://api.airtable.com/v0/meta/bases', {
      headers: { Authorization: `Bearer ${req.user.accessToken}` }
    });
    res.json(response.data.bases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /bases/:baseId/tables
router.get('/bases/:baseId/tables', getUser, async (req, res) => {
  try {
    const response = await axios.get(`https://api.airtable.com/v0/meta/bases/${req.params.baseId}/tables`, {
      headers: { Authorization: `Bearer ${req.user.accessToken}` }
    });
    res.json(response.data.tables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /bases/:baseId/tables/:tableId/fields
router.get('/bases/:baseId/tables/:tableId/fields', getUser, async (req, res) => {
  try {
    const response = await axios.get(`https://api.airtable.com/v0/meta/bases/${req.params.baseId}/tables`, {
      headers: { Authorization: `Bearer ${req.user.accessToken}` }
    });
    const table = response.data.tables.find(t => t.id === req.params.tableId);
    if (!table) return res.status(404).send('Table not found');
    // Filter supported types
    const supportedTypes = ['singleLineText', 'multilineText', 'singleSelect', 'multipleSelects', 'attachment'];
    const fields = table.fields.filter(f => supportedTypes.includes(f.type));
    res.json(fields);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /forms
router.post('/forms', getUser, async (req, res) => {
  const { baseId, tableId, questions } = req.body;
  const form = new Form({
    owner: req.user._id,
    airtableBaseId: baseId,
    airtableTableId: tableId,
    questions
  });
  await form.save();
  res.json(form);
});

// GET /forms
router.get('/forms', getUser, async (req, res) => {
  const forms = await Form.find({ owner: req.user._id });
  res.json(forms);
});

// GET /forms/:id
router.get('/forms/:id', async (req, res) => {
  const form = await Form.findById(req.params.id);
  if (!form) return res.status(404).send('Form not found');
  res.json(form);
});

// POST /forms/:id/submit
router.post('/forms/:id/submit', async (req, res) => {
  const { answers } = req.body;
  const form = await Form.findById(req.params.id).populate('owner');
  if (!form) return res.status(404).send('Form not found');

  // validate
  for (const q of form.questions) {
    if (q.required && !answers[q.questionKey]) return res.status(400).send(`${q.label} is required`);
    // other validations
  }

  // save to Airtable
  const recordData = {};
  for (const q of form.questions) {
    recordData[q.airtableFieldId] = answers[q.questionKey];
  }

  const response = await axios.post(`https://api.airtable.com/v0/${form.airtableBaseId}/${form.airtableTableId}`, {
    records: [{ fields: recordData }]
  }, {
    headers: { Authorization: `Bearer ${form.owner.accessToken}` }
  });

  const airtableRecordId = response.data.records[0].id;

  // save to DB
  const responseDoc = new Response({
    formId: form._id,
    airtableRecordId,
    answers
  });
  await responseDoc.save();

  res.json({ message: 'Submitted' });
});

// GET /forms/:id/responses
router.get('/forms/:id/responses', getUser, async (req, res) => {
  const form = await Form.findById(req.params.id);
  if (!form || form.owner.toString() !== req.user._id.toString()) return res.status(404).send('Form not found');
  const responses = await Response.find({ formId: req.params.id, deletedInAirtable: false });
  res.json(responses);
});

module.exports = router;