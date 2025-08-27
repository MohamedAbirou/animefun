import AddEditGameModal from '@/components/admin/AddEditGameModal'
import { supabase } from '@/lib/supabase'
import { Game } from '@/types/game'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const AdminGamesPage = () => {
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  
  useEffect(() => {
    loadGames()
  }, [])
  
  const loadGames = async () => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setGames(data)
    } catch (error) {
      console.error('Error loading games:', error)
      toast.error('Failed to load games')
    } finally {
      setIsLoading(false)
    }
  }
  


  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      toast.success('Game deleted successfully')
      loadGames()
    } catch (error) {
      console.error('Error deleting game:', error)
      toast.error('Failed to delete game')
    }
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Manage Games
        </h1>
        
        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary"
        >
          Add New Game
        </button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"></div>
              <div className="mt-4 h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-white dark:bg-dark-card rounded-lg shadow-md overflow-hidden"
            >
              {game.screenshots && game.screenshots[0] && (
                <img
                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/games/${game.screenshots[0]}`}
                  alt={game.title}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {game.title}
                </h3>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {game.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {game.download_count} downloads
                  </span>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedGame(game)}
                      className="btn btn-outline btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this game?')) {
                          handleDelete(game.id)
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
      
      <AddEditGameModal
        isOpen={isCreating || !!selectedGame}
        onClose={() => {
          setIsCreating(false)
          setSelectedGame(null)
        }}
        game={selectedGame || undefined}
        onSuccess={loadGames}
      />
    </div>
  )
}

export default AdminGamesPage