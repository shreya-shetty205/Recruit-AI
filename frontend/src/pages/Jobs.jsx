import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Briefcase, MapPin, Clock, X, ChevronDown } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship']
const EXPERIENCE_LEVELS = ['Fresher', 'Entry Level', '1-2 years', '3-5 years', '5-8 years', '8+ years']

const initialForm = {
  title: '', company: '', department: '', location: '',
  type: 'Full-time', experience: 'Fresher',
  skills: '', description: ''
}

const Jobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editJob, setEditJob] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => { fetchJobs() }, [])

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs')
      setJobs(res.data.jobs || res.data || [])
    } catch {
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditJob(null)
    setForm(initialForm)
    setShowModal(true)
  }

  const openEdit = (job) => {
    setEditJob(job)
    setForm({
      title: job.title, company: job.company, department: job.department || '',
      location: job.location, type: job.type, experience: job.experience,
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : job.skills,
      description: job.description
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.company || !form.description) {
      toast.error('Please fill in required fields')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean)
      }
      if (editJob) {
        await api.put(`/jobs/${editJob._id}`, payload)
        toast.success('Job updated successfully')
      } else {
        await api.post('/jobs', payload)
        toast.success('Job created successfully')
      }
      setShowModal(false)
      fetchJobs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save job')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/jobs/${id}`)
      toast.success('Job deleted')
      setDeleteConfirm(null)
      fetchJobs()
    } catch {
      toast.error('Failed to delete job')
    }
  }

  const filtered = jobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.company?.toLowerCase().includes(search.toLowerCase()) ||
    j.location?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Job Postings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{jobs.length} active positions</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">
          <Plus size={16} />
          Create Job
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-9"
        />
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card space-y-3">
              <div className="skeleton h-5 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="skeleton h-16 w-full rounded" />
              <div className="flex gap-2">
                <div className="skeleton h-6 w-20 rounded-full" />
                <div className="skeleton h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            {search ? 'No jobs found' : 'No jobs yet'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {search ? 'Try a different search term' : 'Create your first job posting to start screening candidates'}
          </p>
          {!search && (
            <button onClick={openCreate} className="btn-primary text-sm inline-flex">
              <Plus size={16} /> Create Job
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(job => (
            <div key={job._id} className="card hover:shadow-card-hover transition-all duration-200 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase size={18} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(job)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(job._id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{job.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{job.company}</p>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <MapPin size={12} /> {job.location}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock size={12} /> {job.type}
                </span>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{job.description}</p>

              {job.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.slice(0, 4).map((skill, i) => (
                    <span key={i} className="badge badge-purple text-xs">{skill}</span>
                  ))}
                  {job.skills.length > 4 && (
                    <span className="badge badge-gray text-xs">+{job.skills.length - 4}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editJob ? 'Edit Job' : 'Create New Job'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Job Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior React Developer"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Company *</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={form.company}
                    onChange={e => setForm({ ...form, company: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Engineering"
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. New York, NY"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Job Type</label>
                  <div className="relative">
                    <select
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}
                      className="input-field appearance-none pr-8"
                    >
                      {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="label">Experience Level</label>
                  <div className="relative">
                    <select
                      value={form.experience}
                      onChange={e => setForm({ ...form, experience: e.target.value })}
                      className="input-field appearance-none pr-8"
                    >
                      {EXPERIENCE_LEVELS.map(e => <option key={e}>{e}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Required Skills</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, MongoDB (comma separated)"
                  value={form.skills}
                  onChange={e => setForm({ ...form, skills: e.target.value })}
                  className="input-field"
                />
                <p className="text-xs text-gray-400 mt-1">Separate skills with commas</p>
              </div>

              <div>
                <label className="label">Job Description *</label>
                <textarea
                  rows={5}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input-field resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1 justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 justify-center"
                >
                  {saving ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  ) : editJob ? 'Update Job' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 fade-in">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-600" size={20} />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white text-center mb-2">Delete Job?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Jobs
