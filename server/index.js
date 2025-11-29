const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const formsRoutes = require('./routes/forms');
const webhooksRoutes = require('./routes/webhooks');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api', formsRoutes);
app.use('/webhooks', webhooksRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.get('/', (req, res) => res.send('Hello World'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));