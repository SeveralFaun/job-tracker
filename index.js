const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Job = require('./models/Job');

const cookieParser = require('cookie-parser');
const csrf = require('csurf');

app.use(cookieParser());

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

const requireAuth = require('./middleware/requireAuth');

//app.use('/jobs', requireAuth, require('./routes/jobs'));

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI, {
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Job tracker API is running!');
});

// Add a job
app.post('/jobs', async (req, res) => {
  try {
    // Check for duplicate job by title and company
    const { title, company } = req.body;
    const duplicate = await Job.findOne({ title, company });
    if (duplicate) {
      return res.status(409).json({ error: 'Duplicate job entry' });
    }
    const job = new Job(req.body);
    const saved = await job.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save job' });
  }
});

// Get all jobs
app.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Update a job
app.put('/jobs/:id', async (req, res) => {
  try {
    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete a job
app.delete('/jobs/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

app.listen(3000, () => console.log('Server started on port 3000')); 