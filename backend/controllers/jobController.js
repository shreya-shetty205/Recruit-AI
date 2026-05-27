const Job = require('../models/Job')

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
const getJobs = async (req, res, next) => {
  try {
    const { search, type, page = 1, limit = 50 } = req.query
    const query = { createdBy: req.user._id }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ]
    }

    if (type) query.type = type

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [jobs, total] = await Promise.all([
      Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Job.countDocuments(query),
    ])

    res.json({ jobs, total, page: parseInt(page) })
  } catch (err) {
    next(err)
  }
}

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
const getJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, createdBy: req.user._id })
    if (!job) return res.status(404).json({ message: 'Job not found' })
    res.json(job)
  } catch (err) {
    next(err)
  }
}

// @desc    Create job
// @route   POST /api/jobs
// @access  Private
const createJob = async (req, res, next) => {
  try {
    const { title, company, department, location, type, experience, skills, description } = req.body

    if (!title || !company || !description) {
      return res.status(400).json({ message: 'Title, company and description are required' })
    }

    const job = await Job.create({
      title: title.trim(),
      company: company.trim(),
      department: department?.trim(),
      location: location?.trim() || 'Remote',
      type: type || 'Full-time',
      experience: experience || 'Entry Level',
      skills: Array.isArray(skills) ? skills : (skills || '').split(',').map(s => s.trim()).filter(Boolean),
      description: description.trim(),
      createdBy: req.user._id,
    })

    res.status(201).json(job)
  } catch (err) {
    next(err)
  }
}

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, createdBy: req.user._id })
    if (!job) return res.status(404).json({ message: 'Job not found' })

    const { title, company, department, location, type, experience, skills, description } = req.body

    if (title) job.title = title.trim()
    if (company) job.company = company.trim()
    if (department !== undefined) job.department = department?.trim()
    if (location) job.location = location.trim()
    if (type) job.type = type
    if (experience) job.experience = experience
    if (skills) job.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean)
    if (description) job.description = description.trim()

    await job.save()
    res.json(job)
  } catch (err) {
    next(err)
  }
}

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id })
    if (!job) return res.status(404).json({ message: 'Job not found' })
    res.json({ message: 'Job deleted successfully' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getJobs, getJob, createJob, updateJob, deleteJob }
