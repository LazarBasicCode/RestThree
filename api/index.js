const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// health check
app.get('/', (req, res) => {
  res.json({ status: 'API Running' });
});

// routes
app.use('/api/auth', require('../src/routes/auth'));
app.use('/api/apis', require('../src/routes/api'));

module.exports = app;