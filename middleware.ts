import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin') || 
                        req.nextUrl.pathname.startsWith('/api/admin')

    console.log('Middleware Debug:', {
      pathname: req.nextUrl.pathname,
      tokenType: typeof token,
      tokenKeys: token ? Object.keys(token) : 'No Token',
      tokenRole: token?.role,
      isAdminRoute
    })

    if (isAdminRoute) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
      
      // Explicitly check role as a string property
      if (token.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log('Authorized Callback:', {
          hasToken: !!token,
          tokenType: typeof token,
          tokenKeys: token ? Object.keys(token) : 'No Token'
        })
        return !!token
      }
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
}
