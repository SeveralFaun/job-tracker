const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  companyName: String,
  jobTitle: String,
  status: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  appliedDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Job', JobSchema);