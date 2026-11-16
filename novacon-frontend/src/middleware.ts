import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import NextAuth from 'next-auth'
import { authConfig } from './lib/auth.config'

const { auth } = NextAuth(authConfig)

// Protected page routes
const PROTECTED_PAGES = ['/dashboard', '/org', '/onboarding']

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Redirect logged-in users away from auth pages
    if (pathname === '/login' || pathname === '/register') {
        const session = await auth()
        if (session) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        return NextResponse.next()
    }

    // Allow other public routes
    if (
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon')
    ) {
        return NextResponse.next()
    }

    // Allow public API routes
    if (pathname.startsWith('/api/public')) {
        return NextResponse.next()
    }

    // Check auth for protected routes
    const isProtectedPage = PROTECTED_PAGES.some(p => pathname.startsWith(p))
    const isApiRoute = pathname.startsWith('/api/') && !pathname.startsWith('/api/public')

    if (isProtectedPage || isApiRoute) {
        const session = await auth()

        if (!session) {
            // Redirect to login for pages, 401 for API
            if (isApiRoute) {
                return Response.json({ error: 'Unauthorized' }, { status: 401 })
            }
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('callbackUrl', pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
