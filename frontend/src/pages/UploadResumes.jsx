import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle, Trash2, Download, ChevronDown } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const UploadResumes = () => {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState('')
  const [uploadedResumes, setUploadedResumes] = useState([])
  const [loadingResumes, setLoadingResumes] = useState(true)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchJobs()
    fetchResumes()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs')
      setJobs(res.data.jobs || res.data || [])
    } catch { /* silent */ }
  }

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes')
      setUploadedResumes(res.data.resumes || res.data || [])
    } catch { /* silent */ } finally {
      setLoadingResumes(false)
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = Array.from(e.dataTransfer.files).filter(f =>
      f.type === 'application/pdf' ||
      f.type === 'application/msword' ||
      f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
    if (dropped.length === 0) {
      toast.error('Only PDF and DOC/DOCX files are supported')
      return
    }
    addFiles(dropped)
  }, [])

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files)
    addFiles(selected)
    e.target.value = ''
  }

  const addFiles = (newFiles) => {
    const mapped = newFiles.map(f => ({
      file: f,
      id: Math.random().toString(36).substr(2, 9),
      name: f.name,
      size: f.size,
      status: 'pending',
      progress: 0,
    }))
    setFiles(prev => [...prev, ...mapped])
  }

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleUpload = async () => {
    const pending = files.filter(f => f.status === 'pending')
    if (pending.length === 0) { toast.error('No files to upload'); return }
    if (!selectedJob) { toast.error('Please select a job to match resumes against'); return }

    setUploading(true)
    for (const fileItem of pending) {
      setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'uploading', progress: 0 } : f))
      try {
        const formData = new FormData()
        formData.append('resume', fileItem.file)
        formData.append('jobId', selectedJob)

        await api.post('/resumes/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            const pct = Math.round((e.loaded * 100) / e.total)
            setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, progress: pct } : f))
          }
        })
        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'success', progress: 100 } : f))
      } catch (err) {
        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'error', error: err.response?.data?.message || 'Upload failed' } : f))
      }
    }
    setUploading(false)
    toast.success('Upload complete!')
    fetchResumes()
  }

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'success'))
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleDeleteResume = async (id) => {
    try {
      await api.delete(`/resumes/${id}`)
      toast.success('Resume deleted')
      fetchResumes()
    } catch {
      toast.error('Failed to delete resume')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Resumes</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Upload PDF or DOC resumes to analyze against job descriptions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Job selector */}
          <div className="card">
            <label className="label">Select Job Position *</label>
            <div className="relative">
              <select
                value={selectedJob}
                onChange={e => setSelectedJob(e.target.value)}
                className="input-field appearance-none pr-8"
              >
                <option value="">-- Select a job to match against --</option>
                {jobs.map(j => (
                  <option key={j._id} value={j._id}>{j.title} — {j.company}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {jobs.length === 0 && (
              <p className="text-xs text-amber-600 mt-2">⚠ No jobs found. Create a job first to enable AI matching.</p>
            )}
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
              ${dragOver
                ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/10'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${dragOver ? 'bg-purple-100 dark:bg-purple-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <Upload size={24} className={dragOver ? 'text-purple-600' : 'text-gray-400'} />
            </div>
            <p className="text-base font-medium text-gray-900 dark:text-white mb-1">
              {dragOver ? 'Drop files here' : 'Drag & drop resumes here'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">or click to browse files</p>
            <p className="text-xs text-gray-400">Supports PDF, DOC, DOCX • Max 10MB per file</p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="card space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Files ({files.length})
                </h3>
                <button
                  onClick={clearCompleted}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear completed
                </button>
              </div>

              {files.map(f => (
                <div key={f.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={16} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{f.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{formatSize(f.size)}</span>
                      {f.status === 'uploading' && (
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all duration-300"
                            style={{ width: `${f.progress}%` }}
                          />
                        </div>
                      )}
                      {f.status === 'error' && (
                        <span className="text-xs text-red-500">{f.error}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {f.status === 'success' && <CheckCircle size={16} className="text-green-500" />}
                    {f.status === 'error' && <AlertCircle size={16} className="text-red-500" />}
                    {f.status === 'uploading' && (
                      <span className="text-xs text-purple-600 font-medium">{f.progress}%</span>
                    )}
                    {f.status !== 'uploading' && (
                      <button
                        onClick={() => removeFile(f.id)}
                        className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={handleUpload}
                disabled={uploading || files.every(f => f.status !== 'pending')}
                className="btn-primary w-full justify-center"
              >
                {uploading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                ) : (
                  <><Upload size={16} /> Upload {files.filter(f => f.status === 'pending').length} File(s)</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Uploaded Resumes List */}
        <div className="card h-fit">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Uploaded Resumes ({uploadedResumes.length})
          </h3>

          {loadingResumes ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton w-8 h-8 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 w-3/4 rounded" />
                    <div className="skeleton h-2.5 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : uploadedResumes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No resumes uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {uploadedResumes.map(r => (
                <div key={r._id} className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-colors">
                  <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={14} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{r.originalName || r.filename}</p>
                    <p className="text-xs text-gray-400">{r.candidateName || 'Unknown'}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={`/api/resumes/${r._id}/download`}
                      className="p-1 rounded text-gray-400 hover:text-purple-600 transition-colors"
                      title="Download"
                    >
                      <Download size={13} />
                    </a>
                    <button
                      onClick={() => handleDeleteResume(r._id)}
                      className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UploadResumes
