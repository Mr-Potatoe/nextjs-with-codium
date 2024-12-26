'use client'

import ComponentProviders from '@/components/providers'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return <ComponentProviders>{children}</ComponentProviders>
}
