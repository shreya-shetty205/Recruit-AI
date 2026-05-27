const Job = require('../models/Job')
const Candidate = require('../models/Candidate')
const Resume = require('../models/Resume')

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id

    const [totalJobs, totalCandidates, shortlisted, candidates] = await Promise.all([
      Job.countDocuments({ createdBy: userId }),
      Candidate.countDocuments({ createdBy: userId }),
      Candidate.countDocuments({ createdBy: userId, status: 'shortlisted' }),
      Candidate.find({ createdBy: userId }).select('matchScore status'),
    ])

    // Average match score
    const avgMatchScore = candidates.length > 0
      ? Math.round(candidates.reduce((sum, c) => sum + (c.matchScore || 0), 0) / candidates.length)
      : 0

    // Score distribution
    const scoreDistribution = [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 },
    ]

    candidates.forEach(c => {
      const score = c.matchScore || 0
      if (score <= 20) scoreDistribution[0].count++
      else if (score <= 40) scoreDistribution[1].count++
      else if (score <= 60) scoreDistribution[2].count++
      else if (score <= 80) scoreDistribution[3].count++
      else scoreDistribution[4].count++
    })

    // Status distribution
    const statusCounts = { pending: 0, shortlisted: 0, interview: 0, rejected: 0 }
    candidates.forEach(c => {
      const status = c.status || 'pending'
      if (statusCounts[status] !== undefined) statusCounts[status]++
    })

    const statusDistribution = [
      { name: 'Shortlisted', value: statusCounts.shortlisted },
      { name: 'Pending', value: statusCounts.pending },
      { name: 'Rejected', value: statusCounts.rejected },
      { name: 'Interview', value: statusCounts.interview },
    ].filter(s => s.value > 0)

    res.json({
      totalJobs,
      totalCandidates,
      avgMatchScore,
      shortlisted,
      scoreDistribution,
      statusDistribution,
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { getStats }
