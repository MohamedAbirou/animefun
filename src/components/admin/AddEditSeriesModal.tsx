import { supabase } from '@/lib/supabase'
import { AnimeSeries } from '@/types/wallpaper'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface Props {
  isOpen: boolean
  onClose: () => void
  series?: AnimeSeries
  onSuccess: () => void
}

export default function AddEditSeriesModal({ isOpen, onClose, series, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coverImage, setCoverImage] = useState<string | null>(series?.cover_image || null)
  const [coverLoading, setCoverLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: series || {
      name: '',
      description: '',
      cover_image: ''
    }
  })

  useEffect(() => {
    if (series) {
      reset(series)
      console.log("Series: ", series)
    } else {
      reset({ name: '', description: '', cover_image: '' })
    }
  }, [series, reset])

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)
  
      const payload = {
        ...data,
        cover_image: coverImage,
      }
  
      if (series) {
        const { error } = await supabase
          .from('anime_series')
          .update({
            ...payload,
            updated_at: new Date().toISOString(),
          })
          .eq('id', series.id)
  
        if (error) throw error
  
        toast.success('Series updated successfully')
      } else {
        const { error } = await supabase.from('anime_series').insert(payload)
        if (error) throw error
        toast.success('Series created successfully')
      }
  
      onSuccess()
      onClose()
      reset()
      setCoverImage(null)
    } catch (error: any) {
      console.error('Error saving series:', error.message || error)
      toast.error('Failed to save series. Please ensure you have admin permissions.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setCoverLoading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = fileName // Upload directly to bucket root

      const { error: uploadError } = await supabase.storage
        .from('anime_series')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('anime_series')
        .getPublicUrl(filePath)

      // Update the form with the cover image URL
      return publicUrl
    } catch (error: any) {
      console.error('Upload error:', error.message || error)
      toast.error('Failed to upload cover image. Please ensure the storage bucket exists.')
      return null
    } finally {
      setCoverLoading(false)
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
                  {series ? 'Edit Series' : 'Add New Series'}
                </Dialog.Title>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
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
                      {...register('description')}
                      rows={3}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cover Image
                    </label>
                  
                    {coverLoading ? (
                      <div className="mb-2 flex items-center justify-center h-48 border rounded-lg bg-gray-100 dark:bg-gray-700">
                        <span className="text-sm text-gray-500 dark:text-gray-300 animate-pulse">
                          Uploading...
                        </span>
                      </div>
                    ) : coverImage ? (
                      <div className="mb-2 relative">
                        <img
                          src={coverImage}
                          alt="Cover preview"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => setCoverImage(null)}
                          className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : null}
                  
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const url = await handleCoverUpload(e)
                        if (url) setCoverImage(url)
                      }}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary-50 file:text-primary-700
                        hover:file:bg-primary-100"
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