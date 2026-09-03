// src/proxy.ts  (Next.js 16 renamed middleware → proxy)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './lib/auth'

// Protected page routes
const PROTECTED_PAGES = ['/dashboard', '/sessions', '/speakers', '/registrations', '/analytics']
// Admin-only pages
const ADMIN_ONLY_PAGES = ['/sessions/new', '/speakers/new']

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Allow public routes
    if (
        pathname === '/login' ||
        pathname === '/register' ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon')
    ) {
        return NextResponse.next()
    }

    // Allow public POST to /api/registrations (self-registration)
    if (pathname === '/api/registrations' && request.method === 'POST') {
        return NextResponse.next()
    }

    // Allow public GET for activity ticker
    if (pathname === '/api/activity' && request.method === 'GET') {
        return NextResponse.next()
    }

    // Check auth for protected routes
    const isProtectedPage = PROTECTED_PAGES.some(p => pathname.startsWith(p))
    const isApiRoute = pathname.startsWith('/api/')

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

        // Admin-only checks
        const isAdminOnlyPage = ADMIN_ONLY_PAGES.some(p => pathname.startsWith(p))
        const isAdminEditPage = pathname.includes('/edit')
        const isAdminApiMethod = ['POST', 'PATCH', 'DELETE'].includes(request.method)
        const role = session.user?.role as string

        if ((isAdminOnlyPage || isAdminEditPage) && role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        // Block non-admin write API calls
        if (isApiRoute && isAdminApiMethod && role !== 'ADMIN') {
            return Response.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Block non-admin from registrations data
        if (pathname.startsWith('/api/registrations') && request.method === 'GET' && role !== 'ADMIN') {
            return Response.json({ error: 'Forbidden' }, { status: 403 })
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
