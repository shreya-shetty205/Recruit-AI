const mongoose = require('mongoose')

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: String,
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
  },
  jobTitle: String,
  matchScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  matchingSkills: [String],
  missingSkills: [String],
  allSkills: [String],
  experience: String,
  education: String,
  summary: String,
  status: {
    type: String,
    enum: ['pending', 'shortlisted', 'interview', 'rejected'],
    default: 'pending',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
})

// Index for efficient queries
candidateSchema.index({ jobId: 1, matchScore: -1 })
candidateSchema.index({ createdBy: 1, status: 1 })

module.exports = mongoose.model('Candidate', candidateSchema)
