const Resume = require('../models/Resume')
const Candidate = require('../models/Candidate')
const Job = require('../models/Job')
const { calculateMatchScore, extractExperience } = require('../utils/aiMatcher')

// @desc    Run analysis for all resumes against a job
// @route   POST /api/analysis/run
// @access  Private
const runAnalysis = async (req, res, next) => {
  try {
    const { jobId } = req.body

    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' })
    }

    const job = await Job.findOne({ _id: jobId, createdBy: req.user._id })
    if (!job) return res.status(404).json({ message: 'Job not found' })

    const resumes = await Resume.find({ jobId, uploadedBy: req.user._id })

    if (resumes.length === 0) {
      return res.status(400).json({ message: 'No resumes found for this job. Upload resumes first.' })
    }

    let processed = 0
    const results = []

    for (const resume of resumes) {
      try {
        const matchResult = calculateMatchScore(resume.extractedText || '', job)

        // Re-extract experience with fixed logic to overwrite old stale values
        const freshExperience = extractExperience(resume.extractedText || '')

        // Also update the resume document's experience field
        await Resume.findByIdAndUpdate(resume._id, { experience: freshExperience })

        let candidate = await Candidate.findOne({
          resumeId: resume._id,
          createdBy: req.user._id,
        })

        const autoStatus = matchResult.score >= 50 ? 'shortlisted' : 'pending'

        if (candidate) {
          candidate.matchScore = matchResult.score
          candidate.matchingSkills = matchResult.matchingSkills
          candidate.missingSkills = matchResult.missingSkills
          candidate.summary = matchResult.summary
          candidate.jobId = job._id
          candidate.jobTitle = job.title
          candidate.status = autoStatus
          candidate.experience = freshExperience  // overwrite stale value
          await candidate.save()
        } else {
          candidate = await Candidate.create({
            name: resume.candidateName || 'Unknown',
            email: resume.candidateEmail || '',
            phone: resume.candidatePhone || '',
            resumeId: resume._id,
            jobId: job._id,
            jobTitle: job.title,
            matchScore: matchResult.score,
            matchingSkills: matchResult.matchingSkills,
            missingSkills: matchResult.missingSkills,
            allSkills: resume.skills || [],
            experience: freshExperience,
            education: resume.education || '',
            summary: matchResult.summary,
            status: autoStatus,
            createdBy: req.user._id,
          })
        }

        results.push({ candidateId: candidate._id, score: matchResult.score })
        processed++
      } catch (err) {
        console.error(`Error processing resume ${resume._id}:`, err.message)
      }
    }

    res.json({
      message: `Analysis complete. Processed ${processed} of ${resumes.length} resumes.`,
      processed,
      total: resumes.length,
      results,
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Get analysis summary for a job
// @route   GET /api/analysis/summary/:jobId
// @access  Private
const getAnalysisSummary = async (req, res, next) => {
  try {
    const { jobId } = req.params
    const candidates = await Candidate.find({ jobId, createdBy: req.user._id })

    if (candidates.length === 0) {
      return res.json({ candidates: [], avgScore: 0, topCandidates: [] })
    }

    const avgScore = Math.round(
      candidates.reduce((sum, c) => sum + (c.matchScore || 0), 0) / candidates.length
    )

    const topCandidates = candidates
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5)

    res.json({ candidates, avgScore, topCandidates })
  } catch (err) {
    next(err)
  }
}

module.exports = { runAnalysis, getAnalysisSummary }