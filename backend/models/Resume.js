const mongoose = require('mongoose')

const resumeSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mimetype: String,
  size: Number,
  path: String,
  extractedText: String,
  candidateName: String,
  candidateEmail: String,
  candidatePhone: String,
  skills: [String],
  experience: String,
  education: String,
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  processed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
})

module.exports = mongoose.model('Resume', resumeSchema)
