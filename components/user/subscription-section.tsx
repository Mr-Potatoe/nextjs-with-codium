'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { CheckCircleIcon, XCircleIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  duration: number
  features: string[]
}

interface Subscription {
  id: string
  status: string
  startDate: string
  endDate: string
  membershipPlan: Plan
}

export default function SubscriptionSection() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      const [subResponse, plansResponse] = await Promise.all([
        fetch('/api/user/subscription'),
        fetch('/api/plans')
      ])

      if (subResponse.ok) {
        const data = await subResponse.json()
        setSubscription(data)
      }

      if (plansResponse.ok) {
        const data = await plansResponse.json()
        setAvailablePlans(data)
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error)
      toast.error('Failed to load subscription information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async (planId: string) => {
    try {
      const response = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      const newSubscription = await response.json()
      setSubscription(newSubscription)
      toast.success('Successfully subscribed to plan')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to subscribe to plan')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Loading state for current subscription */}
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>

        {/* Loading state for available plans */}
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="grid gap-8 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="flex items-center space-x-3">
                        <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mt-6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Current Subscription */}
      {subscription && (
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-8 shadow-lg">
          <div className="absolute right-0 top-0 -mt-4 -mr-4">
            <SparklesIcon className="h-24 w-24 text-blue-400 dark:text-blue-300 opacity-20" />
          </div>
          <div className="relative">
            <h3 className="text-xl font-bold text-white dark:text-gray-100">
              Current Membership
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-white/10 dark:bg-black/10 p-4 text-white">
                <div className="text-sm opacity-80">Plan</div>
                <div className="font-semibold">{subscription.membershipPlan.name}</div>
              </div>
              <div className="rounded-lg bg-white/10 dark:bg-black/10 p-4 text-white">
                <div className="text-sm opacity-80">Status</div>
                <div className="font-semibold capitalize">{subscription.status}</div>
              </div>
              <div className="rounded-lg bg-white/10 dark:bg-black/10 p-4 text-white">
                <div className="text-sm opacity-80">Start Date</div>
                <div className="font-semibold">
                  {new Date(subscription.startDate).toLocaleDateString()}
                </div>
              </div>
              <div className="rounded-lg bg-white/10 dark:bg-black/10 p-4 text-white">
                <div className="text-sm opacity-80">End Date</div>
                <div className="font-semibold">
                  {new Date(subscription.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Available Plans
        </h3>
        <div className="grid gap-8 lg:grid-cols-3">
          {availablePlans.map((plan) => {
            const isCurrentPlan = subscription?.membershipPlan.id === plan.id
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl ${
                  isCurrentPlan
                    ? 'border-2 border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                    : 'border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                } p-8 shadow-sm transition-all hover:shadow-md`}
              >
                {isCurrentPlan && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 dark:bg-blue-400 px-4 py-1 text-sm font-medium text-white">
                    Current Plan
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                  <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-0.5 text-sm font-medium text-blue-800 dark:text-blue-300">
                    {plan.duration} days
                  </span>
                </div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">{plan.description}</p>
                <div className="mt-6">
                  <p className="flex items-baseline">
                    <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">/month</span>
                  </p>
                </div>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                      <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan}
                  className={`mt-8 w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold shadow-sm transition-colors
                    ${
                      isCurrentPlan
                        ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                        : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                    }`}
                >
                  {isCurrentPlan ? 'Current Plan' : 'Subscribe'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
