const express = require('express')
const router = express.Router()
const { runAnalysis, getAnalysisSummary } = require('../controllers/analysisController')
const { protect } = require('../middleware/auth')

router.use(protect)

router.post('/run', runAnalysis)
router.get('/summary/:jobId', getAnalysisSummary)

module.exports = router
