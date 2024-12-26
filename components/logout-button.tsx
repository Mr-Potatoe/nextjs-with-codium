'use client'

import { signOut } from 'next-auth/react'
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface LogoutButtonProps {
  className?: string
  variant?: 'icon' | 'full'
}

export default function LogoutButton({ 
  className = '', 
  variant = 'full' 
}: LogoutButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      // Sign out and redirect to home/login page
      await signOut({ 
        redirect: false, 
        callbackUrl: '/auth/signin' 
      })
      
      // Clear any additional client-side state if needed
      router.push('/auth/signin')
    } catch (error) {
      console.error('Logout failed:', error)
      // Optionally show an error toast or message
    } finally {
      setIsLoading(false)
    }
  }

  if (variant === 'icon') {
    return (
      <button 
        onClick={handleLogout} 
        disabled={isLoading}
        className={`text-gray-600 hover:text-red-600 transition-colors ${className}`}
        title="Logout"
      >
        <ArrowLeftOnRectangleIcon className="h-6 w-6" />
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`
        flex items-center justify-center 
        px-4 py-2 
        bg-red-500 text-white 
        rounded-md 
        hover:bg-red-600 
        transition-colors
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
      {isLoading ? 'Logging out...' : 'Logout'}
    </button>
  )
}
