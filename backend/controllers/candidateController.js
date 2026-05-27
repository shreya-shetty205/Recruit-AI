const Candidate = require('../models/Candidate')

// @desc    Get all candidates
// @route   GET /api/candidates
// @access  Private
const getCandidates = async (req, res, next) => {
  try {
    const { jobId, status, minScore, search, page = 1, limit = 10, sort = '-createdAt' } = req.query
    const query = { createdBy: req.user._id }

    if (jobId) query.jobId = jobId
    if (status) query.status = status
    if (minScore) query.matchScore = { $gte: parseInt(minScore) }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [candidates, total] = await Promise.all([
      Candidate.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('jobId', 'title company'),
      Candidate.countDocuments(query),
    ])

    res.json({ candidates, total, page: parseInt(page) })
  } catch (err) {
    next(err)
  }
}

// @desc    Get single candidate
// @route   GET /api/candidates/:id
// @access  Private
const getCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findOne({ _id: req.params.id, createdBy: req.user._id })
      .populate('jobId', 'title company skills description')
      .populate('resumeId', 'originalName filename')

    if (!candidate) return res.status(404).json({ message: 'Candidate not found' })
    res.json(candidate)
  } catch (err) {
    next(err)
  }
}

// @desc    Update candidate status
// @route   PATCH /api/candidates/:id/status
// @access  Private
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const validStatuses = ['pending', 'shortlisted', 'interview', 'rejected']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const candidate = await Candidate.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { status },
      { new: true }
    )

    if (!candidate) return res.status(404).json({ message: 'Candidate not found' })
    res.json(candidate)
  } catch (err) {
    next(err)
  }
}

// @desc    Delete candidate
// @route   DELETE /api/candidates/:id
// @access  Private
const deleteCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id })
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' })
    res.json({ message: 'Candidate deleted successfully' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getCandidates, getCandidate, updateStatus, deleteCandidate }
