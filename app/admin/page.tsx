'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  UserGroupIcon, 
  CreditCardIcon, 
  ArrowTrendingUpIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useTheme } from '@/contexts/theme-context'

// Global debug logging function
const debugLog = (message: string, data?: any) => {
  console.log(`[ADMIN PAGE DEBUG] ${message}`, data || '')
}

interface Stats {
  totalUsers: number
  activeSubscriptions: number
  monthlyRevenue: number
}

export default function AdminDashboard() {
  // Log when component first renders
  debugLog('Component Rendering', { timestamp: new Date().toISOString() })

  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { theme, toggleTheme } = useTheme()

  // Log session changes
  useEffect(() => {
    debugLog('Session State Changed', {
      status,
      hasSession: !!session,
      userRole: session?.user?.role,
      sessionKeys: session ? Object.keys(session) : 'No Session',
      userKeys: session?.user ? Object.keys(session.user) : 'No User Object'
    })

    // Immediate role check
    if (status !== 'loading') {
      debugLog('Immediate Role Check', {
        userRole: session?.user?.role,
        isAdmin: session?.user?.role === 'admin'
      })

      if (session?.user?.role !== 'admin') {
        debugLog('Non-Admin Access Attempt', {
          currentRole: session?.user?.role,
          redirecting: true
        })
        router.push('/dashboard')
      }
    }
  }, [session, status, router])

  useEffect(() => {
    console.log('Admin Dashboard Detailed Debug:', {
      sessionStatus: status,
      sessionExists: !!session,
      sessionUser: session?.user,
      userRole: session?.user?.role,
      isAdmin: session?.user?.role === 'admin',
      sessionKeys: session ? Object.keys(session) : 'No Session',
      userKeys: session?.user ? Object.keys(session.user) : 'No User Object'
    })

    const checkAdminAccess = async () => {
      try {
        // Fetch the session on the server to double-check role
        const response = await fetch('/api/auth/session')
        const sessionData = await response.json()

        console.log('Admin Page Session Check:', {
          sessionData,
          userRole: sessionData?.user?.role,
          isAdmin: sessionData?.user?.role === 'admin'
        })

        // Explicit role check with server-side verification
        if (sessionData?.user?.role !== 'admin') {
          console.warn('Unauthorized admin access attempt')
          router.replace('/dashboard')
          return
        }
      } catch (error) {
        console.error('Admin access verification failed:', error)
        router.replace('/dashboard')
      }
    }

    // Run check if not in loading state
    if (status !== 'loading') {
      checkAdminAccess()
    }
  }, [session, status, router])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        debugLog('Fetching Admin Stats')
        const response = await fetch('/api/admin/stats')
        const data = await response.json()
        setStats(data)
        debugLog('Stats Fetched Successfully', { stats: data })
      } catch (error) {
        debugLog('Error Fetching Stats', { error })
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Render loading state
  if (status === 'loading') {
    debugLog('Rendering Loading State')
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Strict role validation
  if (!session?.user || session.user.role !== 'admin') {
    console.warn('Non-admin user attempting to access admin page', {
      user: session?.user,
      role: session?.user?.role
    })

    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h2>
          <p className="text-gray-600 mb-4">
            You do not have permission to view this page.
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => router.push('/dashboard')} 
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>Current Role: {session?.user?.role || 'Not authenticated'}</p>
          </div>
        </div>
      </div>
    )
  }

  const cards = [
    {
      name: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: UserGroupIcon,
      href: '/admin/members',
      loading: isLoading
    },
    {
      name: 'Active Subscriptions',
      value: stats?.activeSubscriptions ?? 0,
      icon: CreditCardIcon,
      href: '/admin/subscriptions',
      loading: isLoading
    },
    {
      name: 'Monthly Revenue',
      value: `$${stats?.monthlyRevenue?.toLocaleString() ?? '0'}`,
      icon: ArrowTrendingUpIcon,
      href: '#',
      loading: isLoading
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {session.user.name}
              </p>
            </div>
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
          </div>

          <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <Link
                key={card.name}
                href={card.href}
                className="group relative bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <card.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                          {card.name}
                        </dt>
                        <dd className="flex items-baseline">
                          {card.loading ? (
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                          ) : (
                            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                              {card.value}
                            </div>
                          )}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 dark:bg-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
              </Link>
            ))}
          </div>

          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <button className="p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                <h3 className="font-medium text-gray-900 dark:text-white">Manage Users</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  View and manage user accounts
                </p>
              </button>
              <button className="p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                <h3 className="font-medium text-gray-900 dark:text-white">Subscription Plans</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Update subscription plans
                </p>
              </button>
              <button className="p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                <h3 className="font-medium text-gray-900 dark:text-white">Analytics</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  View detailed analytics
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
