'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  PencilIcon, 
  TrashIcon,
  PlusIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import PlanModal, { PlanFormData } from '@/components/plan-modal'
import { toast } from 'react-hot-toast'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  duration: number
  features: string[]
}

export default function SubscriptionsPage() {
  const { data: session, status } = useSession()
  const [plans, setPlans] = useState<Plan[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error',
    message: string
  } | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      console.log('Session:', session)
      if (session?.user?.role === 'admin') {
        fetchPlans()
      }
    }
  }, [status, session])

  const fetchPlans = async () => {
    try {
      setError(null)
      const response = await fetch('/api/admin/plans', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch plans')
      }

      const data = await response.json()
      setPlans(data)
    } catch (error) {
      console.error('Error fetching plans:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePlan = async (planData: PlanFormData) => {
    try {
      const response = await fetch('/api/admin/plans', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create plan')
      }

      const newPlan = await response.json()
      setPlans([...plans, newPlan])
      toast.success('Plan created successfully!')
    } catch (error) {
      console.error('Error creating plan:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create plan')
    }
  }

  const handleUpdatePlan = async (planData: PlanFormData) => {
    if (!selectedPlan?.id) return

    try {
      const response = await fetch(`/api/admin/plans/${selectedPlan.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update plan')
      }

      const updatedPlan = await response.json()
      setPlans(plans.map(plan => 
        plan.id === selectedPlan.id ? updatedPlan : plan
      ))
      toast.success('Plan updated successfully!')
    } catch (error) {
      console.error('Error updating plan:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update plan')
    }
  }

  const handleDeletePlan = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/plans/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete plan')
      }

      setPlans(plans.filter(plan => plan.id !== id))
      toast.success(data.message || 'Plan deleted successfully')
    } catch (error) {
      console.error('Error deleting plan:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete plan')
    }
  }

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setSelectedPlan(null)
    setIsModalOpen(false)
  }

  const handleModalSubmit = (planData: PlanFormData) => {
    if (selectedPlan) {
      handleUpdatePlan(planData)
    } else {
      handleCreatePlan(planData)
    }
    handleModalClose()
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="animate-pulse dark:bg-gray-900">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400 dark:text-red-600" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Access Denied</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-500">
              <p>You must be logged in as an admin to view this page.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (session?.user?.role !== 'admin') {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400 dark:text-red-600" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Access Denied</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-500">
              <p>You must have admin privileges to view this page.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400 dark:text-red-600" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading plans</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-500">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dark:bg-gray-900">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Subscription Plans</h1>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Plan
          </button>
        </div>
      </div>

      {notification && (
        <div className={`rounded-md ${notification.type === 'success' ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-red-900'} p-4 mb-6`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-400 dark:text-green-600" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-400 dark:text-red-600" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.length === 0 ? (
          <div className="col-span-full text-center py-12">No plans found</div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{plan.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors duration-200"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPlan(plan)
                        setIsModalOpen(true)
                      }}
                      className="p-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-200"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                  ${plan.price}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {plan.duration} {plan.duration === 1 ? 'month' : 'months'}
                </p>
                {Array.isArray(plan.features) && plan.features.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-600 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <PlanModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={selectedPlan || undefined}
        onDelete={handleDeletePlan}
      />
    </div>
  )
}
