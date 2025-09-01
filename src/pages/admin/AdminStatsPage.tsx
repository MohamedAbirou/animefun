import { supabase } from '@/lib/supabase'
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { Line, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface Stats {
  totalDownloads: number
  totalCompletions: number
  recentActivity: any[]
  downloadsByType: Record<string, number>
  dailyStats: {
    date: string
    downloads: number
    completions: number
  }[]
}

const AdminStatsPage = () => {
  const [stats, setStats] = useState<Stats>({
    totalDownloads: 0,
    totalCompletions: 0,
    recentActivity: [],
    downloadsByType: {},
    dailyStats: []
  })
  const [dateRange, setDateRange] = useState('7d') // 7d, 30d, all
  
  useEffect(() => {
    loadStats()
  }, [dateRange])
  
  const loadStats = async () => {
    try {
      
      // Get date range
      const now = new Date()
      let startDate = new Date()
      if (dateRange === '7d') {
        startDate.setDate(now.getDate() - 7)
      } else if (dateRange === '30d') {
        startDate.setDate(now.getDate() - 30)
      }
      
      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .from('stats')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
      
      if (statsError) throw statsError
      
      // Process stats
      const downloads = statsData.filter(s => s.interaction_type === 'wallpaper_download').length
      const completions = statsData.filter(s => s.interaction_type === 'quiz_completion').length
      
      // Group by type
      const byType = statsData.reduce((acc: Record<string, number>, curr) => {
        acc[curr.interaction_type] = (acc[curr.interaction_type] || 0) + 1
        return acc
      }, {})
      
      // Group by date
      const byDate = statsData.reduce((acc: Record<string, any>, curr) => {
        const date = format(new Date(curr.created_at), 'yyyy-MM-dd')
        if (!acc[date]) {
          acc[date] = { downloads: 0, completions: 0 }
        }
        
        if (curr.interaction_type === 'wallpaper_download') acc[date].downloads++
        if (curr.interaction_type === 'quiz_completion') acc[date].completions++
        
        return acc
      }, {})
      
      const dailyStats = Object.entries(byDate).map(([date, stats]) => ({
        date,
        ...stats as any
      }))
      
      setStats({
        totalDownloads: downloads,
        totalCompletions: completions,
        recentActivity: statsData.slice(0, 10),
        downloadsByType: byType,
        dailyStats: dailyStats.sort((a, b) => a.date.localeCompare(b.date))
      })
      
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }
  
  const lineChartData = {
    labels: stats.dailyStats.map(s => format(new Date(s.date), 'MMM d')),
    datasets: [
      {
        label: 'Downloads',
        data: stats.dailyStats.map(s => s.downloads),
        borderColor: 'rgb(99, 102, 241)',
        tension: 0.1
      },
      {
        label: 'Quiz Completions',
        data: stats.dailyStats.map(s => s.completions),
        borderColor: 'rgb(244, 63, 94)',
        tension: 0.1
      }
    ]
  }
  
  const pieChartData = {
    labels: Object.keys(stats.downloadsByType).map(t => 
      t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    ),
    datasets: [
      {
        data: Object.values(stats.downloadsByType),
        backgroundColor: [
          'rgb(99, 102, 241)',
          'rgb(244, 63, 94)',
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)'
        ]
      }
    ]
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Statistics
        </h1>
        
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="form-input"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Total Downloads
          </h3>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {stats.totalDownloads}
          </p>
        </div>
        
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Quiz Completions
          </h3>
          <p className="text-3xl font-bold text-accent-600 dark:text-accent-400">
            {stats.totalCompletions}
          </p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Activity Over Time
          </h3>
          <Line data={lineChartData} options={{ responsive: true }} />
        </div>
        
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Interactions by Type
          </h3>
          <Pie data={pieChartData} options={{ responsive: true }} />
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Type</th>
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Item ID</th>
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Session</th>
                <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentActivity.map((activity) => (
                <tr key={activity.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 text-gray-900 dark:text-white">
                    {activity.interaction_type.split('_').map((w: string) => 
                      w.charAt(0).toUpperCase() + w.slice(1)
                    ).join(' ')}
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">
                    {activity.item_id}
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">
                    {activity.session_id}
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">
                    {format(new Date(activity.created_at), 'MMM d, yyyy HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminStatsPage