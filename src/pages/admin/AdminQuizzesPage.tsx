import AddEditQuizModal from '@/components/admin/AddEditQuizModal'
import { supabase } from '@/lib/supabase'
import { Quiz } from '@/types/quiz'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const AdminQuizzesPage = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  
  useEffect(() => {
    loadQuizzes()
  }, [])
  
  const loadQuizzes = async () => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('quizzes')
        .select('*, anime_series(id, name)')
        .order('created_at', { ascending: false })
        
      if (error) throw error
      
      setQuizzes(data as unknown as Quiz[])
    } catch (error) {
      console.error('Error loading quizzes:', error)
      toast.error('Failed to load quizzes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      toast.success('Quiz deleted successfully')
      loadQuizzes()
    } catch (error) {
      console.error('Error deleting quiz:', error)
      toast.error('Failed to delete quiz')
    }
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Manage Quizzes
        </h1>
        
        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary"
        >
          Create New Quiz
        </button>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {quiz.anime_series?.name} • {quiz.completion_count} completions
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedQuiz(quiz)}
                    className="btn btn-outline btn-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this quiz?')) {
                        handleDelete(quiz.id)
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
      
      <AddEditQuizModal
        isOpen={isCreating || !!selectedQuiz}
        onClose={() => {
          setIsCreating(false)
          setSelectedQuiz(null)
        }}
        quiz={selectedQuiz || undefined}
        onSuccess={loadQuizzes}
      />
    </div>
  )
}

export default AdminQuizzesPage