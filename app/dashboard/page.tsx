'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import AuthLayout from '@/components/auth-layout'
import ProfileSection from '@/components/user/profile-section'
import SubscriptionSection from '@/components/user/subscription-section'
import { Tab } from '@headlessui/react'
import { 
  UserCircleIcon, 
  CreditCardIcon, 
  ChartBarIcon,
  SunIcon,
  MoonIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/theme-context'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState(0)
  const { theme, toggleTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      router.push('/admin')
    }
  }, [session, router])

  if (!session?.user) {
    return null
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await signOut({ 
        redirect: false, 
        callbackUrl: '/auth/signin' 
      })
      router.push('/auth/signin')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { name: 'Profile', icon: UserCircleIcon, component: <ProfileSection user={session.user} /> },
    { name: 'Membership', icon: CreditCardIcon, component: <SubscriptionSection /> },
    { name: 'Progress', icon: ChartBarIcon, component: <div className="p-4">Progress tracking coming soon!</div> }
  ]

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {session.user.name}!
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? (
                    <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <SunIcon className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className={`
                    flex items-center 
                    px-4 py-2 
                    bg-red-500 text-white 
                    rounded-md 
                    hover:bg-red-600 
                    transition-colors
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                  {isLoading ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>

            <div className="mt-8">
              <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                <Tab.List className="flex space-x-1">
                  {tabs.map((tab, index) => (
                    <Tab
                      key={tab.name}
                      className={({ selected }) =>
                        classNames(
                          'w-full sm:w-auto px-6 py-3 text-sm font-medium leading-5 transition-all rounded-t-lg',
                          'focus:outline-none',
                          selected
                            ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-t-2 border-blue-600 dark:border-blue-400'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b border-gray-200 dark:border-gray-700'
                        )
                      }
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <tab.icon className={classNames(
                          'h-5 w-5',
                          selectedTab === index 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-gray-400 dark:text-gray-500'
                        )} />
                        <span>{tab.name}</span>
                      </div>
                    </Tab>
                  ))}
                </Tab.List>
                <Tab.Panels className="mt-0">
                  {tabs.map((tab, idx) => (
                    <Tab.Panel
                      key={idx}
                      className={classNames(
                        'rounded-b-lg bg-white dark:bg-gray-800 p-6 transition-colors',
                        'border border-t-0 border-gray-200 dark:border-gray-700'
                      )}
                    >
                      {tab.component}
                    </Tab.Panel>
                  ))}
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
