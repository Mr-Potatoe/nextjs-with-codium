'use client'

import { useState } from 'react'
import { CheckIcon } from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const tiers = [
  {
    name: 'Basic',
    id: 'basic',
    href: '#',
    priceMonthly: 9.99,
    description: 'Perfect for beginners and casual users.',
    features: [
      'Access to basic gym equipment',
      'Limited group classes',
      'Basic fitness tracking',
      'Online workout guides'
    ],
    mostPopular: false
  },
  {
    name: 'Pro',
    id: 'pro',
    href: '#',
    priceMonthly: 29.99,
    description: 'Advanced features for fitness enthusiasts.',
    features: [
      'Full gym equipment access',
      'Unlimited group classes',
      'Personal trainer consultation',
      'Advanced fitness tracking',
      'Nutrition planning'
    ],
    mostPopular: true
  },
  {
    name: 'Elite',
    id: 'elite',
    href: '#',
    priceMonthly: 49.99,
    description: 'Ultimate fitness experience for dedicated athletes.',
    features: [
      'Premium gym facilities',
      'Unlimited advanced classes',
      'Personal trainer sessions',
      'Comprehensive health assessment',
      'Nutrition and recovery program',
      'Priority booking'
    ],
    mostPopular: false
  }
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function SubscriptionsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleSelectPlan = (planId: string) => {
    if (!session?.user) {
      router.push('/login')
      return
    }
    setSelectedPlan(planId)
    // TODO: Implement subscription logic
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            Membership Plans
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            Choose the perfect plan that fits your fitness journey and goals.
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
          {tiers.map((tier) => (
            <div 
              key={tier.id}
              className={classNames(
                tier.mostPopular 
                  ? 'border-2 border-blue-600 dark:border-blue-400 shadow-sm' 
                  : 'border border-gray-200 dark:border-gray-700',
                'rounded-lg p-6 bg-white dark:bg-gray-800 flex flex-col relative'
              )}
            >
              {tier.mostPopular && (
                <span className="absolute top-0 right-0 px-3 py-1 text-xs font-semibold tracking-wide uppercase text-white bg-blue-600 dark:bg-blue-500 rounded-tr-lg rounded-bl-lg">
                  Most Popular
                </span>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {tier.name}
                </h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  {tier.description}
                </p>
                <p className="mt-4 mb-6">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                    ${tier.priceMonthly}
                  </span>
                  <span className="ml-1 text-xl font-medium text-gray-500 dark:text-gray-400">
                    /month
                  </span>
                </p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <span className="text-base text-gray-500 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleSelectPlan(tier.id)}
                className={classNames(
                  selectedPlan === tier.id
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 border border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600',
                  'w-full py-3 px-6 rounded-md text-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400'
                )}
              >
                {selectedPlan === tier.id ? 'Selected' : 'Choose Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
