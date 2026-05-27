import { useState, useEffect } from 'react'
import {
  Search, Download, Eye, ChevronDown, ChevronLeft, ChevronRight,
  Users, Mail, Phone, X, CheckCircle, XCircle, Briefcase, Trash2
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10

const Candidates = () => {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [scoreFilter, setScoreFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    fetchCandidates()
  }, [page, statusFilter, scoreFilter])

  const fetchCandidates = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page,
        limit: PAGE_SIZE,
        ...(statusFilter && { status: statusFilter }),
        ...(scoreFilter && { minScore: scoreFilter }),
      })
      const res = await api.get(`/candidates?${params}`)
      setCandidates(res.data.candidates || res.data || [])
      setTotal(res.data.total || 0)
    } catch {
      toast.error('Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/candidates/${id}/status`, { status })
      toast.success(`Status updated to ${status}`)
      fetchCandidates()
      if (selected?._id === id) setSelected(prev => ({ ...prev, status }))
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this candidate? This cannot be undone.')) return
    try {
      await api.delete(`/candidates/${id}`)
      toast.success('Candidate deleted')
      if (selected?._id === id) { setSelected(null); setShowDetail(false) }
      fetchCandidates()
    } catch {
      toast.error('Failed to delete candidate')
    }
  }

  const filtered = candidates.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-600'
    if (score >= 55) return 'text-blue-600'
    if (score >= 35) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBarColor = (score) => {
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Candidates</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{total} total candidates in pipeline</p>
        </div>
        <button
          onClick={() => {
            const csv = [
              ['Name', 'Email', 'Match Score', 'Status', 'Job'],
              ...filtered.map(c => [c.name, c.email, c.matchScore, c.status, c.jobTitle])
            ].map(r => r.join(',')).join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = 'candidates.csv'; a.click()
            URL.revokeObjectURL(url)
          }}
          className="btn-secondary text-sm"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <div className="relative sm:w-44">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              className="input-field appearance-none pr-8"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative sm:w-44">
            <select
              value={scoreFilter}
              onChange={e => { setScoreFilter(e.target.value); setPage(1) }}
              className="input-field appearance-none pr-8"
            >
              <option value="">All Scores</option>
              <option value="75">75%+ (Excellent)</option>
              <option value="55">55%+ (Good)</option>
              <option value="35">35%+ (Fair)</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-6 py-3.5">Candidate</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3.5 hidden md:table-cell">Job Applied</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3.5">Match Score</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3.5 hidden sm:table-cell">Skills</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3.5">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="skeleton w-9 h-9 rounded-full" />
                        <div className="space-y-1.5">
                          <div className="skeleton h-3.5 w-28 rounded" />
                          <div className="skeleton h-3 w-36 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell"><div className="skeleton h-3.5 w-24 rounded" /></td>
                    <td className="px-4 py-4"><div className="skeleton h-3.5 w-16 rounded" /></td>
                    <td className="px-4 py-4 hidden sm:table-cell"><div className="skeleton h-6 w-32 rounded-full" /></td>
                    <td className="px-4 py-4"><div className="skeleton h-6 w-20 rounded-full" /></td>
                    <td className="px-4 py-4"><div className="skeleton h-8 w-20 rounded-lg" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No candidates found</p>
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                            {c.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{c.jobTitle || '—'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getScoreBarColor(c.matchScore || 0)}`}
                            style={{ width: `${c.matchScore || 0}%` }}
                          />
                        </div>
                        <span className={`text-sm font-semibold ${getScoreColor(c.matchScore || 0)}`}>
                          {c.matchScore || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(c.matchingSkills || []).slice(0, 2).map((s, i) => (
                          <span key={i} className="badge badge-purple text-xs">{s}</span>
                        ))}
                        {(c.matchingSkills || []).length > 2 && (
                          <span className="badge badge-gray text-xs">+{c.matchingSkills.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setSelected(c); setShowDetail(true) }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                          title="View details"
                        >
                          <Eye size={15} />
                        </button>
                        {c.resumeId && (
                          <a
                            href={`/api/resumes/${c.resumeId}/download`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="Download resume"
                          >
                            <Download size={15} />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete candidate"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const p = i + 1
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === p
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Candidate Details</h3>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {selected.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">{selected.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Mail size={13} /> {selected.email}
                  </div>
                  {selected.phone && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Phone size={13} /> {selected.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Score */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Match Score</span>
                  <span className={`text-lg font-bold ${getScoreColor(selected.matchScore || 0)}`}>
                    {selected.matchScore || 0}%
                  </span>
                </div>
                <div className="h-2.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getScoreBarColor(selected.matchScore || 0)}`}
                    style={{ width: `${selected.matchScore || 0}%` }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Experience</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selected.experience || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Education</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selected.education || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Job Applied</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selected.jobTitle || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              {/* Skills */}
              {(selected.matchingSkills?.length > 0 || selected.missingSkills?.length > 0) && (
                <div className="space-y-3">
                  {selected.matchingSkills?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                        <CheckCircle size={12} className="text-green-500" /> Matching Skills
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.matchingSkills.map((s, i) => (
                          <span key={i} className="badge badge-green text-xs">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.missingSkills?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                        <XCircle size={12} className="text-red-500" /> Missing Skills
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.missingSkills.map((s, i) => (
                          <span key={i} className="badge badge-red text-xs">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => handleStatusUpdate(selected._id, 'shortlisted')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-green-50 hover:bg-green-100 text-green-700 transition-colors"
                >
                  <CheckCircle size={14} /> Shortlist
                </button>
                <button
                  onClick={() => handleStatusUpdate(selected._id, 'interview')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                >
                  <Briefcase size={14} /> Interview
                </button>
                <button
                  onClick={() => handleStatusUpdate(selected._id, 'rejected')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                >
                  <XCircle size={14} /> Reject
                </button>
                <button
                  onClick={() => handleDelete(selected._id)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                  title="Delete candidate"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

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

export default Candidates
