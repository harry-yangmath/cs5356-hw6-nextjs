import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define paths that require authentication
  const authenticatedPaths = ['/todos', '/admin']
  
  // Check if the current path requires authentication
  const isPathProtected = authenticatedPaths.some(
    protectedPath => path.startsWith(protectedPath)
  )

  // Get the session
  const session = await auth.session()

  // Handle /todos route
  if (path.startsWith('/todos')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/sign-in', request.url))
    }
  }

  // Handle /admin route
  if (path.startsWith('/admin')) {
    // Redirect if not authenticated or not an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // If no redirects are needed, continue with the request
  return NextResponse.next()
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones that start with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth routes
     */
    '/((?!_next/static|_next/image|favicon.ico|auth).*)'
  ]
}