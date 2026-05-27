import { useState } from 'react'
import { Bell, Moon, Sun, Shield, Trash2, Save } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const Settings = () => {
  const { darkMode, toggleDarkMode } = useTheme()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    newCandidate: true,
    analysisComplete: true,
    weeklyReport: false,
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved')
  }

  const handleDeleteAccount = () => {
    logout()
    toast.success('Account deleted')
    navigate('/login')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your app preferences</p>
      </div>

      {/* Appearance */}
      <div className="card space-y-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          {darkMode ? <Moon size={16} className="text-purple-500" /> : <Sun size={16} className="text-purple-500" />}
          Appearance
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Switch between light and dark theme</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-purple-600' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card space-y-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell size={16} className="text-purple-500" />
          Notifications
        </h3>
        {[
          { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive important alerts via email' },
          { key: 'newCandidate', label: 'New Candidate', desc: 'Notify when a new resume is uploaded' },
          { key: 'analysisComplete', label: 'Analysis Complete', desc: 'Notify when AI analysis finishes' },
          { key: 'weeklyReport', label: 'Weekly Report', desc: 'Receive a weekly recruitment summary' },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
            <button
              onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${notifications[key] ? 'bg-purple-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications[key] ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <button onClick={handleSaveNotifications} className="btn-primary text-sm">
            <Save size={14} /> Save Preferences
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="card space-y-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield size={16} className="text-purple-500" />
          Security
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Change Password</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Update your account password</p>
          </div>
          <button
            onClick={() => toast('Password change coming soon!')}
            className="btn-secondary text-sm"
          >
            Change
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border border-red-200 dark:border-red-900/50 space-y-4">
        <h3 className="text-base font-semibold text-red-600 flex items-center gap-2">
          <Trash2 size={16} />
          Danger Zone
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Delete Account</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Permanently delete your account and all data</p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 fade-in">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-600" size={20} />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white text-center mb-2">Delete Account?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This will permanently delete all your data. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleDeleteAccount} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
