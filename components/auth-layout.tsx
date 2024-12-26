'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthLayout({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode
  requireAdmin?: boolean
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || status === 'loading') return

    console.log('AuthLayout Debug:', {
      status,
      session: session?.user,
      requireAdmin,
      isAdmin: session?.user?.role === 'admin'
    })

    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`)
      return
    }

    if (requireAdmin && session?.user?.role !== 'admin') {
      console.warn('Non-admin user attempting to access admin area')
      router.push('/dashboard')
      return
    }
  }, [session, status, router, requireAdmin, mounted])

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated' || (requireAdmin && session?.user?.role !== 'admin')) {
    return null
  }

  return children
}
