const express = require('express')
const router = express.Router()
const { uploadResume, getResumes, downloadResume, deleteResume } = require('../controllers/resumeController')
const { protect } = require('../middleware/auth')
const upload = require('../middleware/upload')

router.use(protect)

router.route('/').get(getResumes)
router.post('/upload', upload.single('resume'), uploadResume)
router.get('/:id/download', downloadResume)
router.delete('/:id', deleteResume)

module.exports = router
