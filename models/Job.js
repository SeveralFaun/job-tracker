const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  companyName: String,
  jobTitle: String,
  status: String,
  appliedDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Job', JobSchema);