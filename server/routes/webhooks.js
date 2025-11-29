const express = require('express');
const Response = require('../models/Response');

const router = express.Router();

// POST /webhooks/airtable
router.post('/airtable', async (req, res) => {
  const { action, recordId, data } = req.body; // Assume webhook payload structure

  try {
    if (action === 'update') {
      const response = await Response.findOne({ airtableRecordId: recordId });
      if (response) {
        response.answers = data.fields; // Update with new data
        response.updatedAt = new Date();
        await response.save();
      }
    } else if (action === 'delete') {
      await Response.updateOne({ airtableRecordId: recordId }, { deletedInAirtable: true });
    }
    res.status(200).send('OK');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
});

module.exports = router;