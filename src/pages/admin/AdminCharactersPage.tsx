import AddEditCharacterModal from '@/components/admin/AddEditCharacterModal'
import { supabase } from '@/lib/supabase'
import { AnimeCharacter } from '@/types/quiz'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const AdminCharactersPage = () => {
  const [characters, setCharacters] = useState<AnimeCharacter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<AnimeCharacter | null>(null)
  const [selectedAnime, setSelectedAnime] = useState<string>('')
  const [series, setSeries] = useState<any[]>([])
  
  useEffect(() => {
    loadSeries()
    loadCharacters()
  }, [])
  
  const loadSeries = async () => {
    try {
      const { data, error } = await supabase
        .from('anime_series')
        .select('*')
        .order('name')
      
      if (error) throw error
      
      setSeries(data)
    } catch (error) {
      console.error('Error loading series:', error)
      toast.error('Failed to load anime series')
    }
  }
  
  const loadCharacters = async () => {
    try {
      setIsLoading(true)
      
      let query = supabase
        .from('anime_characters')
        .select('*, anime_series(id, name)')
        .order('name')
      
      if (selectedAnime) {
        query = query.eq('anime_id', selectedAnime)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      setCharacters(data)
    } catch (error) {
      console.error('Error loading characters:', error)
      toast.error('Failed to load characters')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('anime_characters')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      toast.success('Character deleted successfully')
      loadCharacters()
    } catch (error) {
      console.error('Error deleting character:', error)
      toast.error('Failed to delete character')
    }
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Manage Characters
        </h1>
        
        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary"
        >
          Add New Character
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Anime Series
            </label>
            <select
              value={selectedAnime}
              onChange={(e) => setSelectedAnime(e.target.value)}
              className="form-input"
            >
              <option value="">All Series</option>
              {series.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={loadCharacters}
              className="btn btn-primary w-full"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>
      
      {/* Characters Grid */}
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
          {characters.map((character) => (
            <div
              key={character.id}
              className="bg-white dark:bg-dark-card rounded-lg shadow-md overflow-hidden"
            >
              {character.image && (
                <img
                  src={character.image}
                  alt={character.name}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {character.name}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {character.anime_series?.name}
                </p>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {character.description}
                </p>
                
                {character.traits && character.traits.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {character.traits.map((trait, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setSelectedCharacter(character)}
                    className="btn btn-outline btn-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this character?')) {
                        handleDelete(character.id)
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
      
      {characters.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No characters found. Try adjusting your filter or add some characters.
          </p>
        </div>
      )}
      
      <AddEditCharacterModal
        isOpen={isCreating || !!selectedCharacter}
        onClose={() => {
          setIsCreating(false)
          setSelectedCharacter(null)
        }}
        character={selectedCharacter}
        onSuccess={loadCharacters}
      />
    </div>
  )
}

export default AdminCharactersPage