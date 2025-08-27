import LoadingScreen from '@/components/common/LoadingScreen'
import { useWallpaperStore } from '@/store/wallpaperStore'
import { Wallpaper, WallpaperType } from '@/types/wallpaper'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function WallpaperDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fetchWallpaperById, downloadWallpaper } = useWallpaperStore()
  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('')
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({})
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  useEffect(() => {
    const loadWallpaper = async () => {
      if (!id) {
        navigate('/wallpapers')
        return
      }
      
      const wallpaperData = await fetchWallpaperById(id)

      if (wallpaperData) {
        setWallpaper(wallpaperData)
        // Set first type as default selected
        const types = Object.keys(wallpaperData.previews)
        if (types.length > 0) {
          setSelectedType(types[0])
        }
      }
      
      setIsLoading(false)
    }
    
    loadWallpaper()
  }, [id, navigate, fetchWallpaperById])

  // Handle image loading state
  const handleImageLoad = (type: string) => {
    setLoadingImages(prev => ({
      ...prev,
      [type]: false
    }))
  }

  // Start loading state when type changes
  useEffect(() => {
    if (selectedType) {
      setLoadingImages(prev => ({
        ...prev,
        [selectedType]: true
      }))
      setPreviewImage(null) // Reset preview when changing type
    }
  }, [selectedType])
  
  const handleDownload = async (type: string) => {
    if (!wallpaper) return
    
    await downloadWallpaper(wallpaper, type)
  }

  const openPreview = (imageUrl: string) => {
    setPreviewImage(imageUrl)
  }
  
  if (isLoading) {
    return <LoadingScreen />
  }
  
  if (!wallpaper) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Wallpaper not found
        </h2>
        <button
          onClick={() => navigate('/wallpapers')}
          className="btn btn-primary"
        >
          Back to Wallpapers
        </button>
      </div>
    )
  }

  const getPackCount = (type: string) => {
    const countKey = `${type.toLowerCase()}_count`
    return wallpaper.pack_counts?.[countKey] || 0
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with title and main download button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {wallpaper.anime_series?.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {wallpaper.download_count} downloads
            </p>
          </div>
          
          <button
            onClick={() => handleDownload('main')}
            className="btn btn-primary"
          >
            Download Main Pack ({getPackCount('main')})
          </button>
        </div>
        
        {/* Type Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-4">
              {Object.keys(wallpaper.previews).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={clsx(
                    'py-2 text-sm font-medium border-b-2 transition-colors',
                    selectedType === type
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  )}
                >
                  {type.replace(/_/g, ' ')} ({getPackCount(type)})
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Preview Images */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {wallpaper.previews[selectedType as WallpaperType]?.map((preview: any, index: number) => (
              <div 
                key={index} 
                className="relative aspect-[16/9] overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openPreview(preview)}
              >
                {loadingImages[selectedType] && (
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                )}
                <img
                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/wallpapers/${preview}`}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                  onLoad={() => handleImageLoad(selectedType)}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Download button for current type */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => handleDownload(selectedType)}
            className="btn btn-primary"
          >
            Download {selectedType.replace(/_/g, ' ')} Pack ({getPackCount(selectedType)})
          </button>
        </div>
      </div>

      {/* Full-screen Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-7xl w-full max-h-[90vh]">
            <img
              src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/wallpapers/${previewImage}`}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}