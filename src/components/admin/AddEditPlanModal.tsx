import { useSubscriptionStore } from '@/store/subscriptionStore'
import { SubscriptionPlan } from '@/types/subscription'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

interface Props {
  isOpen: boolean
  onClose: () => void
  plan?: SubscriptionPlan | null
  onSuccess: () => void
}

export default function AddEditPlanModal({ isOpen, onClose, plan, onSuccess }: Props) {
  const { createPlan, updatePlan } = useSubscriptionStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, control, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: plan || {
      name: '',
      description: '',
      price: 0,
      currency: 'usd',
      interval: 'month' as const,
      features: [''],
      stripe_price_id: '',
      trial_days: 0,
      is_active: true
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'features' as never
  })

  const watchedName = watch('name')
  const isBasicPlan = watchedName?.toLowerCase() === 'basic'

  useEffect(() => {
    if (plan) {
      reset({
        ...plan,
        features: plan.features.length > 0 ? plan.features : ['']
      })
    } else {
      reset({
        name: '',
        description: '',
        price: 0,
        currency: 'usd',
        interval: 'month',
        features: [''],
        stripe_price_id: '',
        trial_days: 0,
        is_active: true
      })
    }
  }, [plan, reset])

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)

      // Filter out empty features
      const features = data.features.filter((f: string) => f.trim() !== '')

      // Only allow trial days for Basic plan
      const trialDays = isBasicPlan ? parseInt(data.trial_days) || 0 : 0

      const planData = {
        ...data,
        features,
        price: parseFloat(data.price),
        trial_days: trialDays
      }

      let success = false
      if (plan) {
        success = await updatePlan(plan.id, planData)
      } else {
        success = await createPlan(planData)
      }

      if (success) {
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error('Error saving plan:', error)
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
                  {plan ? 'Edit Plan' : 'Add New Plan'}
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
                      {...register('description', { required: 'Description is required' })}
                      rows={3}
                      className="form-input"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('price', { required: 'Price is required', min: 0 })}
                        className="form-input"
                      />
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Interval
                      </label>
                      <select {...register('interval')} className="form-input">
                        <option value="month">Monthly</option>
                        <option value="year">Yearly</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Stripe Price ID
                      </label>
                      <input
                        type="text"
                        {...register('stripe_price_id', { required: 'Stripe Price ID is required' })}
                        className="form-input"
                        placeholder="price_..."
                      />
                      {errors.stripe_price_id && (
                        <p className="mt-1 text-sm text-red-600">{errors.stripe_price_id.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Trial Days
                        {!isBasicPlan && (
                          <span className="text-xs text-amber-600 dark:text-amber-400 ml-1">
                            (Basic plan only)
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        {...register('trial_days', { min: 0 })}
                        className={`form-input ${!isBasicPlan ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                        disabled={!isBasicPlan}
                        placeholder={!isBasicPlan ? 'Only for Basic plan' : '0'}
                      />
                      {!isBasicPlan && (
                        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                          Free trials are only available for the Basic plan
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Features
                    </label>
                    <div className="space-y-2">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                          <input
                            {...register(`features.${index}` as const)}
                            className="form-input flex-1"
                            placeholder="Feature description"
                          />
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="px-3 py-2 text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => append('')}
                        className="text-sm text-primary-600 hover:text-primary-800"
                      >
                        Add Feature
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('is_active')}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Active
                    </label>
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