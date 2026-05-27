import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { Briefcase, Users, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react'
import StatCard from '../components/StatCard'
import api from '../services/api'
import { Link } from 'react-router-dom'

const COLORS = ['#9333ea', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentCandidates, setRecentCandidates] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, candidatesRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/candidates?limit=5&sort=-createdAt'),
      ])
      setStats(statsRes.data)
      setRecentCandidates(candidatesRes.data.candidates || [])
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      // Use mock data if API fails
      setStats({
        totalJobs: 12,
        totalCandidates: 148,
        avgMatchScore: 72,
        shortlisted: 34,
        scoreDistribution: [
          { range: '0-20', count: 8 },
          { range: '21-40', count: 15 },
          { range: '41-60', count: 32 },
          { range: '61-80', count: 58 },
          { range: '81-100', count: 35 },
        ],
        statusDistribution: [
          { name: 'Shortlisted', value: 34 },
          { name: 'Pending', value: 72 },
          { name: 'Rejected', value: 28 },
          { name: 'Interview', value: 14 },
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { title: 'Total Jobs', value: stats?.totalJobs ?? 0, icon: Briefcase, color: 'purple', change: 12, changeType: 'up' },
    { title: 'Total Candidates', value: stats?.totalCandidates ?? 0, icon: Users, color: 'blue', change: 8, changeType: 'up' },
    { title: 'Avg Match Score', value: stats?.avgMatchScore ? `${stats.avgMatchScore}%` : '0%', icon: TrendingUp, color: 'green', change: 3, changeType: 'up' },
    { title: 'Shortlisted', value: stats?.shortlisted ?? 0, icon: CheckCircle, color: 'orange', change: 5, changeType: 'up' },
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-sm font-bold text-purple-600">{payload[0].value} candidates</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Overview of your recruitment pipeline</p>
        </div>
        <Link to="/upload" className="btn-primary text-sm">
          <span>Upload Resumes</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Score Distribution */}
        <div className="card lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Score Distribution</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">AI match score ranges across all candidates</p>
            </div>
          </div>
          {loading ? (
            <div className="h-56 skeleton rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats?.scoreDistribution || []} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#9333ea" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Donut */}
        <div className="card lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Candidate Status</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Current pipeline breakdown</p>
          </div>
          {loading ? (
            <div className="h-56 skeleton rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats?.statusDistribution || []}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(stats?.statusDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: 12, color: '#6b7280' }}>{value}</span>}
                />
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Candidates */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Candidates</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest applicants in your pipeline</p>
          </div>
          <Link to="/candidates" className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton w-9 h-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3.5 w-32 rounded" />
                  <div className="skeleton h-3 w-48 rounded" />
                </div>
                <div className="skeleton h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentCandidates.length === 0 ? (
          <div className="text-center py-10">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No candidates yet. Upload resumes to get started.</p>
            <Link to="/upload" className="btn-primary text-sm mt-4 inline-flex">Upload Resumes</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 pb-3">Candidate</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 pb-3">Job</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 pb-3">Match Score</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {recentCandidates.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                            {c.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400">{c.jobTitle || '—'}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-purple-500"
                            style={{ width: `${c.matchScore || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{c.matchScore || 0}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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

export default Dashboard
