import { supabase } from '@/lib/supabase'
import { AnimeCharacter } from '@/types/quiz'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface Props {
  isOpen: boolean
  onClose: () => void
  character?: AnimeCharacter | null
  onSuccess: () => void
}

export default function AddEditCharacterModal({ isOpen, onClose, character, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [series, setSeries] = useState<any[]>([])
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: character || {
      name: '',
      description: '',
      image: '',
      traits: [],
      fun_facts: [],
      anime_id: ''
    }
  })
  
  useEffect(() => {
    fetchSeries()
  }, [])
  
  useEffect(() => {
    if (character) {
      reset({
        ...character,
        traits: character.traits?.join(', ') as any,
        fun_facts: character.fun_facts?.join('\n') as any
      })
    } else {
      reset({
        name: '',
        description: '',
        image: '',
        traits: [],
        fun_facts: [],
        anime_id: ''
      })
    }
  }, [character, reset])
  
  const fetchSeries = async () => {
    try {
      const { data, error } = await supabase
        .from('anime_series')
        .select('*')
        .order('name')
      
      if (error) throw error
      
      setSeries(data)
    } catch (error) {
      console.error('Error fetching series:', error)
      toast.error('Failed to load anime series')
    }
  }
  
  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)

      delete(data.anime_series);
      
      // Process traits and fun facts
      const traits = data.traits.split(',').map((t: string) => t.trim()).filter(Boolean)
      const funFacts = data.fun_facts.split('\n').map((f: string) => f.trim()).filter(Boolean)
      
      const payload = {
        ...data,
        traits,
        fun_facts: funFacts,
        updated_at: new Date().toISOString()
      }
      
      if (character) {
        const { error } = await supabase
          .from('anime_characters')
          .update(payload)
          .eq('id', character.id)
        
        if (error) throw error
        
        toast.success('Character updated successfully')
      } else {
        const { error } = await supabase
          .from('anime_characters')
          .insert(payload)
        
        if (error) throw error
        
        toast.success('Character created successfully')
      }
      
      onSuccess()
      onClose()
      reset()
    } catch (error) {
      console.error('Error saving character:', error)
      toast.error('Failed to save character')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                >
                  {character ? 'Edit Character' : 'Add New Character'}
                </Dialog.Title>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Anime Series
                    </label>
                    <select
                      {...register('anime_id', { required: 'Anime series is required' })}
                      className="form-input"
                    >
                      <option value="">Select a series</option>
                      {series.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    {errors.anime_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.anime_id.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name
                    </label>
                    <input
                      type="text"
                      {...register('name', { required: 'Name is required' })}
                      className="form-input"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      {...register('description', { required: 'Description is required' })}
                      rows={3}
                      className="form-input"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Image URL
                    </label>
                    <input
                      type="text"
                      {...register('image')}
                      className="form-input"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Traits (comma-separated)
                    </label>
                    <input
                      type="text"
                      {...register('traits')}
                      className="form-input"
                      placeholder="Brave, Smart, Loyal"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fun Facts (one per line)
                    </label>
                    <textarea
                      {...register('fun_facts')}
                      rows={3}
                      className="form-input"
                      placeholder="Enter fun facts, one per line"
                    />
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary"
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}