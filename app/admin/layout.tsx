'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { 
  UserGroupIcon, 
  CreditCardIcon, 
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline'
import AuthLayout from '@/components/auth-layout'
import Providers from '@/components/providers'
import AdminLayoutClient from '@/components/admin/admin-layout-client'
import { ThemeProvider } from '@/contexts/theme-context'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Members', href: '/admin/members', icon: UserGroupIcon },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCardIcon },
  { name: 'Reports', href: '/admin/reports', icon: ChartBarIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <ThemeProvider>
        <AuthLayout requireAdmin>
          <AdminLayoutClient>
            {children}
          </AdminLayoutClient>
        </AuthLayout>
      </ThemeProvider>
    </Providers>
  )
}
