const path = require('path')
const fs = require('fs')
const Resume = require('../models/Resume')
const Candidate = require('../models/Candidate')
const Job = require('../models/Job')
const {
  extractName, extractEmail, extractPhone,
  extractSkills, extractExperience, extractEducation,
  calculateMatchScore,
} = require('../utils/aiMatcher')

// Parse PDF text
const parsePDF = async (filePath) => {
  try {
    const pdfParse = require('pdf-parse')
    const dataBuffer = fs.readFileSync(filePath)
    const data = await pdfParse(dataBuffer)
    return data.text || ''
  } catch (err) {
    console.error('PDF parse error:', err.message)
    return ''
  }
}

// @desc    Upload resume
// @route   POST /api/resumes/upload
// @access  Private
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const { jobId } = req.body
    let job = null
    if (jobId) {
      job = await Job.findById(jobId)
    }

    // Extract text from PDF
    let extractedText = ''
    if (req.file.mimetype === 'application/pdf') {
      extractedText = await parsePDF(req.file.path)
    }

    // Extract candidate info
    const cleanFilename = req.file.originalname
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\s*resume\s*/gi, ' ')
      .replace(/\s*cv\s*/gi, ' ')
      .replace(/\(\d+\)/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    // Debug logging — check server terminal to see what PDF text looks like
    console.log('=== PDF FIRST 10 LINES ===')
    extractedText.split('\n').slice(0, 10).forEach((l, i) => {
      if (l.trim()) console.log(`  [${i}] ${JSON.stringify(l.trim())}`)
    })

    const candidateName = extractName(extractedText) || cleanFilename || 'Unknown Candidate'
    console.log('=== EXTRACTED NAME:', candidateName, '===')
    const candidateEmail = extractEmail(extractedText)
    const candidatePhone = extractPhone(extractedText)
    const skills = extractSkills(extractedText)
    const experience = extractExperience(extractedText)
    const education = extractEducation(extractedText)

    // Save resume
    const resume = await Resume.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      extractedText,
      candidateName,
      candidateEmail,
      candidatePhone,
      skills,
      experience,
      education,
      jobId: jobId || null,
      uploadedBy: req.user._id,
      processed: true,
    })

    // Calculate match score if job provided
    let matchResult = { score: 0, matchingSkills: [], missingSkills: [], summary: '' }
    if (job) {
      matchResult = calculateMatchScore(extractedText, job)
    }

    // Create or update candidate
    let candidate = null
    if (candidateEmail) {
      candidate = await Candidate.findOne({
        email: candidateEmail,
        jobId: jobId || null,
        createdBy: req.user._id,
      })
    }

    if (candidate) {
      // Update existing candidate
      candidate.resumeId = resume._id
      candidate.matchScore = matchResult.score
      candidate.matchingSkills = matchResult.matchingSkills
      candidate.missingSkills = matchResult.missingSkills
      candidate.allSkills = skills
      candidate.experience = experience
      candidate.education = education
      candidate.summary = matchResult.summary
      if (job) candidate.jobTitle = job.title
      await candidate.save()
    } else {
      // Create new candidate
      candidate = await Candidate.create({
        name: candidateName,
        email: candidateEmail,
        phone: candidatePhone,
        resumeId: resume._id,
        jobId: jobId || null,
        jobTitle: job?.title || '',
        matchScore: matchResult.score,
        matchingSkills: matchResult.matchingSkills,
        missingSkills: matchResult.missingSkills,
        allSkills: skills,
        experience,
        education,
        summary: matchResult.summary,
        createdBy: req.user._id,
      })
    }

    res.status(201).json({
      message: 'Resume uploaded and analyzed successfully',
      resume: {
        _id: resume._id,
        originalName: resume.originalName,
        candidateName,
        matchScore: matchResult.score,
      },
      candidate: {
        _id: candidate._id,
        name: candidate.name,
        matchScore: candidate.matchScore,
      },
    })
  } catch (err) {
    // Clean up uploaded file on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    next(err)
  }
}

// @desc    Get all resumes
// @route   GET /api/resumes
// @access  Private
const getResumes = async (req, res, next) => {
  try {
    const { jobId, page = 1, limit = 20 } = req.query
    const query = { uploadedBy: req.user._id }
    if (jobId) query.jobId = jobId

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [resumes, total] = await Promise.all([
      Resume.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).select('-extractedText'),
      Resume.countDocuments(query),
    ])

    res.json({ resumes, total })
  } catch (err) {
    next(err)
  }
}

// @desc    Download resume
// @route   GET /api/resumes/:id/download
// @access  Private
const downloadResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, uploadedBy: req.user._id })
    if (!resume) return res.status(404).json({ message: 'Resume not found' })

    if (!fs.existsSync(resume.path)) {
      return res.status(404).json({ message: 'File not found on server' })
    }

    res.download(resume.path, resume.originalName)
  } catch (err) {
    next(err)
  }
}

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, uploadedBy: req.user._id })
    if (!resume) return res.status(404).json({ message: 'Resume not found' })

    // Delete file from disk
    if (resume.path && fs.existsSync(resume.path)) {
      fs.unlinkSync(resume.path)
    }

    await resume.deleteOne()
    res.json({ message: 'Resume deleted successfully' })
  } catch (err) {
    next(err)
  }
}

module.exports = { uploadResume, getResumes, downloadResume, deleteResume }
