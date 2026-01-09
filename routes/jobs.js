const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

router.post('/', async (req, res) => {
  try {
    // Check if duplicate job exists
    const { companyName, jobTitle } = req.body;
    const userId = req.user._id;
    if (!companyName || !jobTitle) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const existingJob = await Job.findOne({
      companyName,
      jobTitle,
      user: userId
    });

    if (existingJob) {
      return res.status(400).json({ error: 'Job already exists' });
    }

    const job = new Job({ ...req.body, user: req.user._id });
    const saved = await job.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save job' });
  }
});

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user._id });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Update a job
router.put('/:id', async (req, res) => {
  try {
    const updated = await Job.findByIdAndUpdate(
      { _id:req.params.id, user: req.user._id },
        req.body,
        { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete a job
router.delete('/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

module.exports = router;