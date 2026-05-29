const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const path = require('path')
require('dotenv').config()

const connectDB = require('./config/db')
const errorHandler = require('./middleware/errorHandler')

const authRoutes = require('./routes/auth')
const jobRoutes = require('./routes/jobs')
const resumeRoutes = require('./routes/resumes')
const candidateRoutes = require('./routes/candidates')
const analysisRoutes = require('./routes/analysis')
const dashboardRoutes = require('./routes/dashboard')

const app = express()

connectDB()

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://recruit-ai-lyart.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    // Allow all vercel preview URLs
    if (origin.endsWith('.vercel.app')) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('CORS blocked: ' + origin))
  },
  credentials: true,
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/resumes', resumeRoutes)
app.use('/api/candidates', candidateRoutes)
app.use('/api/analysis', analysisRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log('🚀 RecruitAI server running on port ' + PORT)
})

module.exports = app