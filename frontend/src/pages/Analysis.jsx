import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  Search, ChevronDown, CheckCircle, XCircle,
  TrendingUp, BookOpen, Briefcase, Award, RefreshCw
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const Analysis = () => {
  const [candidates, setCandidates] = useState([])
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState('')
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [minScore, setMinScore] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => { fetchJobs() }, [])
  useEffect(() => { if (selectedJob) fetchCandidates() }, [selectedJob])

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs')
      setJobs(res.data.jobs || res.data || [])
    } catch { /* silent */ }
  }

  const fetchCandidates = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/candidates?jobId=${selectedJob}`)
      setCandidates(res.data.candidates || res.data || [])
    } catch {
      toast.error('Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeAll = async () => {
    if (!selectedJob) { toast.error('Select a job first'); return }
    setAnalyzing(true)
    try {
      await api.post('/analysis/run', { jobId: selectedJob })
      toast.success('Analysis complete!')
      fetchCandidates()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleStatusUpdate = async (candidateId, status) => {
    try {
      await api.patch(`/candidates/${candidateId}/status`, { status })
      toast.success(`Candidate ${status}`)
      setCandidates(prev => prev.map(c => c._id === candidateId ? { ...c, status } : c))
      if (selected?._id === candidateId) setSelected(prev => ({ ...prev, status }))
    } catch {
      toast.error('Failed to update status')
    }
  }

  const filtered = candidates
    .filter(c => {
      const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
      return matchSearch && (c.matchScore || 0) >= minScore
    })
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-600 bg-green-50 dark:bg-green-900/20'
    if (score >= 55) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
    if (score >= 35) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    return 'text-red-600 bg-red-50 dark:bg-red-900/20'
  }

  const getScoreBar = (score) => {
    if (score >= 75) return 'bg-green-500'
    if (score >= 55) return 'bg-blue-500'
    if (score >= 35) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resume Analysis</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">AI-powered resume screening and scoring</p>
        </div>
        <button
          onClick={handleAnalyzeAll}
          disabled={!selectedJob || analyzing}
          className="btn-primary text-sm"
        >
          {analyzing ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>
          ) : (
            <><RefreshCw size={15} /> Run Analysis</>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="label">Filter by Job</label>
            <div className="relative">
              <select
                value={selectedJob}
                onChange={e => setSelectedJob(e.target.value)}
                className="input-field appearance-none pr-8"
              >
                <option value="">All Jobs</option>
                {jobs.map(j => (
                  <option key={j._id} value={j._id}>{j.title} — {j.company}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex-1">
            <label className="label">Search Candidates</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-9"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <label className="label">Min Score: {minScore}%</label>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={minScore}
              onChange={e => setMinScore(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600 mt-2.5"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Candidate List */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {filtered.length} candidate{filtered.length !== 1 ? 's' : ''} found
          </p>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                  <div className="skeleton h-2 w-full rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-12">
              <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {selectedJob ? 'No candidates for this job yet' : 'Select a job to view candidates'}
              </p>
            </div>
          ) : (
            filtered.map((c, idx) => (
              <div
                key={c._id}
                onClick={() => setSelected(c)}
                className={`card cursor-pointer transition-all duration-200 hover:shadow-card-hover ${selected?._id === c._id ? 'ring-2 ring-purple-500 shadow-card-hover' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                        {c.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {idx < 3 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white">#{idx + 1}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.email}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-sm font-bold ${getScoreColor(c.matchScore || 0)}`}>
                    {c.matchScore || 0}%
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getScoreBar(c.matchScore || 0)}`}
                      style={{ width: `${c.matchScore || 0}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <StatusBadge status={c.status} />
                  <span className="text-xs text-gray-400">{c.experience || 'N/A'}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-3">
          {selected ? (
            <CandidateDetail
              candidate={selected}
              onStatusUpdate={handleStatusUpdate}
              getScoreColor={getScoreColor}
              getScoreBar={getScoreBar}
            />
          ) : (
            <div className="card h-full flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                <TrendingUp size={28} className="text-purple-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Select a Candidate</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Click on a candidate from the list to view their detailed AI analysis report
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const CandidateDetail = ({ candidate: c, onStatusUpdate, getScoreColor, getScoreBar }) => {
  const matchingSkills = c.matchingSkills || []
  const missingSkills = c.missingSkills || []

  return (
    <div className="card space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {c.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{c.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{c.email}</p>
            {c.phone && <p className="text-sm text-gray-500 dark:text-gray-400">{c.phone}</p>}
          </div>
        </div>
        <div className={`text-2xl font-bold px-4 py-2 rounded-xl ${getScoreColor(c.matchScore || 0)}`}>
          {c.matchScore || 0}%
        </div>
      </div>

      {/* Score bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>AI Match Score</span>
          <span className="font-medium">{c.matchScore || 0}%</span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getScoreBar(c.matchScore || 0)}`}
            style={{ width: `${c.matchScore || 0}%` }}
          />
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3">
        <InfoItem icon={Briefcase} label="Experience" value={c.experience || 'Not specified'} />
        <InfoItem icon={BookOpen} label="Education" value={c.education || 'Not specified'} />
        <InfoItem icon={Award} label="Job Applied" value={c.jobTitle || 'N/A'} />
        <InfoItem icon={TrendingUp} label="Status" value={<StatusBadge status={c.status} />} />
      </div>

      {/* Skills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
            <CheckCircle size={14} className="text-green-500" />
            Matching Skills ({matchingSkills.length})
          </h4>
          {matchingSkills.length === 0 ? (
            <p className="text-xs text-gray-400">No matching skills found</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {matchingSkills.map((s, i) => (
                <span key={i} className="badge badge-green text-xs">{s}</span>
              ))}
            </div>
          )}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
            <XCircle size={14} className="text-red-500" />
            Missing Skills ({missingSkills.length})
          </h4>
          {missingSkills.length === 0 ? (
            <p className="text-xs text-gray-400">No missing skills</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.map((s, i) => (
                <span key={i} className="badge badge-red text-xs">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {c.summary && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">AI Summary</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 leading-relaxed">
            {c.summary}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onStatusUpdate(c._id, 'shortlisted')}
          disabled={c.status === 'shortlisted'}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            c.status === 'shortlisted'
              ? 'bg-green-100 text-green-700 cursor-default'
              : 'bg-green-50 hover:bg-green-100 text-green-700'
          }`}
        >
          <CheckCircle size={15} />
          {c.status === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}
        </button>
        <button
          onClick={() => onStatusUpdate(c._id, 'interview')}
          disabled={c.status === 'interview'}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            c.status === 'interview'
              ? 'bg-blue-100 text-blue-700 cursor-default'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
          }`}
        >
          <Briefcase size={15} />
          {c.status === 'interview' ? 'In Interview' : 'Interview'}
        </button>
        <button
          onClick={() => onStatusUpdate(c._id, 'rejected')}
          disabled={c.status === 'rejected'}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            c.status === 'rejected'
              ? 'bg-red-100 text-red-700 cursor-default'
              : 'bg-red-50 hover:bg-red-100 text-red-700'
          }`}
        >
          <XCircle size={15} />
          {c.status === 'rejected' ? 'Rejected' : 'Reject'}
        </button>
      </div>
    </div>
  )
}

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
    <Icon size={15} className="text-purple-500 mt-0.5 flex-shrink-0" />
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <div className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{value}</div>
    </div>
  </div>
)

const StatusBadge = ({ status }) => {
  const map = {
    shortlisted: 'badge-green',
    rejected: 'badge-red',
    pending: 'badge-yellow',
    interview: 'badge-blue',
  }
  return (
    <span className={`badge ${map[status] || 'badge-gray'} capitalize`}>
      {status || 'pending'}
    </span>
  )
}

export default Analysis
