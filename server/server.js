require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// connect db
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/meetings';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Mongo connected'))
  .catch(err => console.error('Mongo error', err));

app.get('/', (req, res) => res.send('AI Meeting Summarizer API (Groq-powered)'));

app.use('/api/ai', require('./routes/ai'));
app.use('/api/email', require('./routes/email'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
