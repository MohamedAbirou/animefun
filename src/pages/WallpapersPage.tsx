import { useEffect, useState } from 'react'
import { useWallpaperStore } from '@/store/wallpaperStore'
import { Link } from 'react-router-dom'
import { AnimeSeries, WallpaperType } from '@/types/wallpaper'

const WallpapersPage = () => {
  const { wallpapers, series, isLoading, currentPage, totalPages, filters, fetchWallpapers, fetchSeries } = useWallpaperStore()
  const [selectedType, setSelectedType] = useState<WallpaperType | undefined>(undefined)
  const [selectedSeries, setSelectedSeries] = useState<string | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleItems, setVisibleItems] = useState(12) // Initial number of items to show
  
  useEffect(() => {
    fetchWallpapers()
    fetchSeries()
  }, [])
  
  const handleFilter = () => {
    fetchWallpapers(1, {
      type: selectedType,
      seriesId: selectedSeries,
      query: searchQuery || undefined
    })
  }
  
  const handlePageChange = (page: number) => {
    fetchWallpapers(page, filters)
  }

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleItems < wallpapers.length) {
          setVisibleItems(prev => Math.min(prev + 12, wallpapers.length))
        }
      },
      { threshold: 0.1 }
    )

    const sentinel = document.getElementById('scroll-sentinel')
    if (sentinel) {
      observer.observe(sentinel)
    }

    return () => observer.disconnect()
  }, [visibleItems, wallpapers.length])
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Anime Wallpapers
      </h1>
      
      {/* Filters */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select
              value={selectedType || ''}
              onChange={(e) => setSelectedType(e.target.value as WallpaperType || undefined)}
              className="form-input"
            >
              <option value="">All Types</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="desktop_sketchy">Desktop Sketchy</option>
              <option value="mobile_sketchy">Mobile Sketchy</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Anime Series
            </label>
            <select
              value={selectedSeries || ''}
              onChange={(e) => setSelectedSeries(e.target.value || undefined)}
              className="form-input"
            >
              <option value="">All Series</option>
              {series.map((s: AnimeSeries) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wallpapers..."
              className="form-input"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleFilter}
            className="btn btn-primary"
          >
            Apply Filters
          </button>
        </div>
      </div>
      
      {/* Wallpapers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"></div>
              <div className="mt-4 h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : wallpapers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallpapers.slice(0, visibleItems).map((wallpaper) => (
              <Link
                key={wallpaper.id}
                to={`/wallpapers/${wallpaper.id}`}
                className="group"
              >
                <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                  {wallpaper.anime_series?.cover_image && (
                    <img
                      loading="lazy"
                      src={wallpaper.anime_series.cover_image}
                      alt={wallpaper.anime_series.name}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      width="400"
                      height="300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-semibold text-white">
                      {wallpaper.anime_series?.name}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {wallpaper.download_count} downloads
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Infinite scroll sentinel */}
          {visibleItems < wallpapers.length && (
            <div id="scroll-sentinel" className="h-10" />
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === page
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white dark:bg-dark-card border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No wallpapers found. Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  )
}

export default WallpapersPage