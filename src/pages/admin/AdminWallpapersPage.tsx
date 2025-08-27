import AddEditWallpaperModal from '@/components/admin/AddEditWallpaperModal'
import { useWallpaperStore } from '@/store/wallpaperStore'
import { Wallpaper } from '@/types/wallpaper'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const AdminWallpapersPage = () => {
  const { wallpapers, fetchWallpapers, deleteWallpaper } = useWallpaperStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null)
  
  useEffect(() => {
    loadWallpapers()
  }, [])
  
  const loadWallpapers = async () => {
    setIsLoading(true)
    await fetchWallpapers()
    setIsLoading(false)
  }
  
  const handleDelete = async (id: string) => {
    try {
      await deleteWallpaper(id)
      toast.success('Wallpaper deleted successfully')
    } catch (error) {
      console.error('Error deleting wallpaper:', error)
      toast.error('Failed to delete wallpaper')
    }
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Manage Wallpapers
        </h1>
        
        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary"
        >
          Add New Wallpaper
        </button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"></div>
              <div className="mt-4 h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallpapers.map((wallpaper) => (
            <div
              key={wallpaper.id}
              className="bg-white dark:bg-dark-card rounded-lg shadow-md overflow-hidden"
            >
                <img
                  src={wallpaper.anime_series?.cover_image || ""}
                  alt={wallpaper.anime_series?.name}
                  className="w-full h-48 object-cover"
                />
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {wallpaper.anime_series?.name}
                </h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {wallpaper.download_count} downloads
                  </span>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedWallpaper(wallpaper)}
                      className="btn btn-outline btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this wallpaper?')) {
                          handleDelete(wallpaper.id)
                        }
                      }}
                      className="btn btn-outline btn-sm text-red-600 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <AddEditWallpaperModal
        isOpen={isCreating || !!selectedWallpaper}
        onClose={() => {
          setIsCreating(false)
          setSelectedWallpaper(null)
        }}
        wallpaper={selectedWallpaper || undefined}
        onSuccess={loadWallpapers}
      />
    </div>
  )
}

export default AdminWallpapersPage