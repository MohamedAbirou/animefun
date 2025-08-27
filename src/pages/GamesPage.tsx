import LoadingScreen from '@/components/common/LoadingScreen'
import { supabase } from '@/lib/supabase'
import { Game } from '@/types/game'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const GamesPage = () => {
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  
  useEffect(() => {
    fetchGames()
  }, [])
  
  const fetchGames = async () => {
    try {
      setIsLoading(true)
      
      let query = supabase
        .from('games')
        .select('*')
        .order('download_count', { ascending: false })
        .order("created_at", { ascending: false })
      
      if (selectedTag) {
        query = query.contains('tags', [selectedTag])
      }
      
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      setGames(data as Game[])
    } catch (error) {
      console.error('Error fetching games:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isLoading) {
    return <LoadingScreen />
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Mobile Games
      </h1>
      
      {/* Filters */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games..."
              className="form-input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tag
            </label>
            <input
              type="text"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              placeholder="Filter by tag..."
              className="form-input"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={fetchGames}
              className="btn btn-primary w-full"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Link
            key={game.id}
            to={`/games/${game.id}`}
            className="bg-white dark:bg-dark-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
          >
            {game.screenshots && game.screenshots[0] && (
              <img
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/games/${game.screenshots[0]}`}
                alt={game.title}
                className="w-full h-48 object-cover"
              />
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {game.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {game.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {game.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {game.download_count} downloads
                </span>
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  View Details →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {games.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No games found. Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  )
}

export default GamesPage