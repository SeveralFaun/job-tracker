const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Job tracker API is running!');
});

app.listen(3000, () => console.log('Server started on port 3000'));

const jobs = [];

app.post('/jobs', (req, res) => {
  const job = req.body;
  jobs.push(job);
  res.status(201).json(job);
});

app.get('/jobs', (req, res) => {
  res.json(jobs);
});