import { supabase } from '@/lib/supabase'
import { Game } from '@/types/game'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface Props {
  isOpen: boolean
  onClose: () => void
  game?: Game
  onSuccess: () => void
}

export default function AddEditGameModal({ isOpen, onClose, game, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [screenshots, setScreenshots] = useState<string[]>(game?.screenshots || [])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: game || {
      title: '',
      description: '',
      apk_file: '',
      tags: []
    }
  })

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, type: 'screenshot') => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    try {
      setUploadProgress(prev => ({ ...prev, [type]: 0 }))
      
      if (type === 'screenshot') {
        const uploadPromises = Array.from(files).map(async (file) => {
          const fileExt = file.name.split('.').pop()
          const fileName = `${crypto.randomUUID()}.${fileExt}`
          const filePath = `screenshots/${fileName}`
          
          const { error: uploadError } = await supabase.storage
            .from('games')
            .upload(filePath, file)
          
          if (uploadError) throw uploadError
          return filePath
        })
        
        const paths = await Promise.all(uploadPromises)
        setScreenshots(prev => [...prev, ...paths])
        toast.success('Screenshots uploaded successfully')
      }
      
      setUploadProgress(prev => ({ ...prev, [type]: 100 }))
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload file')
    } finally {
      setTimeout(() => {
        setUploadProgress(prev => ({ ...prev, [type]: 0 }))
      }, 1000)
    }
  }, [])
  
  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: any) => {
    try {
      if (screenshots.length === 0) {
        toast.error('Please upload at least one screenshot')
        return
      }
      
      setIsSubmitting(true)
      
      const payload = {
        ...data,
        screenshots: screenshots,
        tags: data.tags.split(',').map((t: string) => t.trim()),
      }
      
      if (game) {
        const { error } = await supabase
          .from('games')
          .update({
            ...payload,
            updated_at: new Date().toISOString()
          })
          .eq('id', game.id)
        
        if (error) throw error
        
        toast.success('Game updated successfully')
      } else {
        const { error } = await supabase
          .from('games')
          .insert(payload)
        
        if (error) throw error
        
        toast.success('Game created successfully')
      }
      
      onSuccess()
      onClose()
      reset()
      setScreenshots([])
    } catch (error) {
      console.error('Error saving game:', error)
      toast.error('Failed to save game')
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
                  {game ? 'Edit Game' : 'Add New Game'}
                </Dialog.Title>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Title
                    </label>
                    <input
                      type="text"
                      {...register('title', { required: 'Title is required' })}
                      className="form-input"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
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
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      {...register('tags')}
                      className="form-input"
                    />
                  </div>
                  
                  {/* APK File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      APK File
                    </label>
                    <input
                      type="text"
                      {...register('apk_file', { required: 'APK file is required' })}
                      className="form-input"
                    />
                    {errors.apk_file && (
                      <p className="mt-1 text-sm text-red-600">{errors.apk_file.message}</p>
                    )}
                  </div>
                  
                  {/* Screenshots Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Screenshots
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileUpload(e, 'screenshot')}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    {uploadProgress.screenshot > 0 && uploadProgress.screenshot < 100 && (
                      <div className="mt-1 h-2 w-full bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-primary-600 rounded-full" 
                          style={{ width: `${uploadProgress.screenshot}%` }}
                        ></div>
                      </div>
                    )}
                    
                    {screenshots.length > 0 && (
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {screenshots.map((path, index) => (
                          <div key={index} className="relative">
                            <img
                              src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/games/${path}`}
                              alt={`Screenshot ${index + 1}`}
                              className="h-20 w-full object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeScreenshot(index)}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
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