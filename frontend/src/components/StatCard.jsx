const StatCard = ({ title, value, icon: Icon, color, change, changeType, loading }) => {
  const colorMap = {
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
      text: 'text-purple-600',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
      text: 'text-blue-600',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',
      text: 'text-green-600',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      icon: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
      text: 'text-orange-600',
    },
  }

  const c = colorMap[color] || colorMap.purple

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton w-10 h-10 rounded-lg" />
        </div>
        <div className="skeleton h-8 w-16 rounded mb-2" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    )
  }

  return (
    <div className={`card hover:shadow-card-hover transition-shadow duration-200 ${c.bg} border-0`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.icon}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      {change !== undefined && (
        <p className={`text-xs font-medium ${changeType === 'up' ? 'text-green-600' : 'text-red-500'}`}>
          {changeType === 'up' ? '↑' : '↓'} {change}% from last month
        </p>
      )}
    </div>
  )
}

export default StatCard
