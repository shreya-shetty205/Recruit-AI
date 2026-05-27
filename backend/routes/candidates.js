const express = require('express')
const router = express.Router()
const { getCandidates, getCandidate, updateStatus, deleteCandidate } = require('../controllers/candidateController')
const { protect } = require('../middleware/auth')

router.use(protect)

router.route('/').get(getCandidates)
router.route('/:id').get(getCandidate).delete(deleteCandidate)
router.patch('/:id/status', updateStatus)

module.exports = router
