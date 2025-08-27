export interface Quiz {
  id: string
  title: string
  description: string
  anime_id: string | null
  min_questions: number
  max_questions: number
  questions: QuizQuestion[]
  is_default: boolean
  completion_count: number
  use_locker: boolean
  created_at: string
  updated_at: string
  anime_series?: {
    id: string
    name: string
  } | null
}

export interface QuizQuestion {
  text: string
  options: QuizOption[]
}

export interface QuizOption {
  text: string
  character_id: string
}

export interface AnimeCharacter {
  id: string
  anime_id: string
  name: string
  description: string
  image: string
  traits: string[]
  fun_facts: string[]
  created_at: string
  updated_at: string
  anime_series?: {
    id: string
    name: string
  }
}

export interface QuizResult {
  id: string
  quiz_id: string
  character_id: string
  session_id: string
  created_at: string
  character?: AnimeCharacter
  quiz?: {
    title: string
  }
}