import LoadingScreen from '@/components/common/LoadingScreen'
import { supabase } from '@/lib/supabase'
import { QuizResult } from '@/types/quiz'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

const QuizResultsPage = () => {
  const { id, resultId } = useParams<{ id: string; resultId: string }>()
  const navigate = useNavigate()
  const [result, setResult] = useState<QuizResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    fetchResult()
  }, [id, resultId])
  
  const fetchResult = async () => {
    if (!id || !resultId) return
    
    try {
      setIsLoading(true)
      
      // First fetch the quiz result
      const { data: resultData, error: resultError } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .single()
      
      if (resultError) throw resultError
      
      // Then fetch the quiz
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('title')
        .eq('id', resultData.quiz_id)
        .single()

        if (quizError) throw quizError
      
        // Then fetch the characters
      const { data: characters, error: charactersError } = await supabase
        .from('anime_characters')
        .select('*')

      if (charactersError) throw charactersError
      
      const character = characters?.find(
        (char: any) => char.id === resultData.character_id
      )
      
      // Combine the data
      setResult({
        ...resultData,
        character,
        quiz: {
          title: quizData.title,
        }
      })
      
    } catch (error) {
      console.error('Error fetching result:', error)
      toast.error('Failed to load quiz result')
      navigate('/quizzes')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleShare = async () => {
    try {
      await navigator.share({
        title: `My ${result?.quiz?.title} Result`,
        text: `I got ${result?.character?.name}! Take the quiz to find out your character!`,
        url: window.location.href
      })
    } catch (error) {
      console.error('Error sharing:', error)
      // Fallback to copying link
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }
  
  if (isLoading) {
    return <LoadingScreen />
  }
  
  if (!result || !result.character) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Result not found
        </h2>
        <button
          onClick={() => navigate('/quizzes')}
          className="btn btn-primary"
        >
          Back to Quizzes
        </button>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg overflow-hidden">
        {/* Hero Section */}
        <div className="relative h-64 md:h-96">
          <img
            src={result.character.image}
            alt={result?.character?.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              You got {result?.character?.name}!
            </h1>
            <p className="text-lg md:text-xl text-gray-200">
              from {result.quiz?.title}
            </p>
          </div>
        </div>
        
        {/* Character Details */}
        <div className="p-6 md:p-8">
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">About Your Character</h2>
            <div className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-8">
              {result.character.description}
            </div>
            
            {/* Character Traits */}
            {result.character.traits && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Character Traits</h3>
                <div className="flex flex-wrap gap-2">
                  {result.character.traits.map((trait: string) => (
                    <span
                      key={trait}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full text-sm"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Fun Facts */}
            {result.character.fun_facts && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Fun Facts</h3>
                <ul className="list-disc list-inside space-y-2">
                  {result.character.fun_facts.map((fact: string, index: number) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleShare}
              className="btn btn-primary flex-1"
            >
              Share Result
            </button>
            <button
              onClick={() => navigate('/quizzes')}
              className="btn btn-outline flex-1"
            >
              Take Another Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizResultsPage