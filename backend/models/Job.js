const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
    default: 'Remote',
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'],
    default: 'Full-time',
  },
  experience: {
    type: String,
    default: 'Entry Level',
  },
  skills: [{
    type: String,
    trim: true,
  }],
  description: {
    type: String,
    required: [true, 'Job description is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
})

// Text index for search
jobSchema.index({ title: 'text', company: 'text', description: 'text' })

module.exports = mongoose.model('Job', jobSchema)
