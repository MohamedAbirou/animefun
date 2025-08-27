import AddEditSeriesModal from '@/components/admin/AddEditSeriesModal'
import { supabase } from '@/lib/supabase'
import { AnimeSeries } from '@/types/wallpaper'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const AdminSeriesPage = () => {
  const [series, setSeries] = useState<AnimeSeries[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedSeries, setSelectedSeries] = useState<AnimeSeries | null>(null)
  
  useEffect(() => {
    loadSeries()
  }, [])
  
  const loadSeries = async () => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('anime_series')
        .select('*')
        .order('name')
      
      if (error) throw error
      
      setSeries(data)
    } catch (error) {
      console.error('Error loading series:', error)
      toast.error('Failed to load anime series')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('anime_series')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      toast.success('Series deleted successfully')
      loadSeries()
    } catch (error) {
      console.error('Error deleting series:', error)
      toast.error('Failed to delete series')
    }
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Manage Anime Series
        </h1>
        
        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary"
        >
          Add New Series
        </button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"></div>
              <div className="mt-4 h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {series.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-dark-card rounded-lg shadow-md overflow-hidden"
            >
              {s.cover_image && (
                <img
                  src={s.cover_image}
                  alt={s.name}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {s.name}
                </h3>
                
                {s.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {s.description}
                  </p>
                )}
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setSelectedSeries(s)}
                    className="btn btn-outline btn-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this series?')) {
                        handleDelete(s.id)
                      }
                    }}
                    className="btn btn-outline btn-sm text-red-600 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <AddEditSeriesModal
        isOpen={isCreating || !!selectedSeries}
        onClose={() => {
          setIsCreating(false)
          setSelectedSeries(null)
        }}
        series={selectedSeries || undefined}
        onSuccess={loadSeries}
      />
    </div>
  )
}

export default AdminSeriesPage