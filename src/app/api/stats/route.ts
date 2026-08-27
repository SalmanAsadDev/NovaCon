import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const TICKET_PRICES: Record<string, number> = {
    STANDARD: 2500,
    PREMIUM: 5000,
    WORKSHOP: 3500,
}

export async function GET() {
    const [
        totalRegistrations,
        checkedIn,
        sessionsLive,
        totalSessions,
        totalSpeakers,
        checkedInRegistrations,
    ] = await Promise.all([
        prisma.registration.count(),
        prisma.registration.count({ where: { status: 'CHECKED_IN' } }),
        prisma.session.count({ where: { status: 'LIVE' } }),
        prisma.session.count(),
        prisma.speaker.count(),
        prisma.registration.findMany({ 
            where: { status: 'CHECKED_IN' },
            select: { ticketType: true } 
        }),
    ])

    const revenue = checkedInRegistrations.reduce((sum, r) => sum + (TICKET_PRICES[r.ticketType] || 0), 0)

    // Count distinct universities
    const universityResult = await prisma.registration.groupBy({
        by: ['university'],
    })

    return NextResponse.json({
        totalRegistrations,
        checkedIn,
        sessionsLive,
        totalSessions,
        totalSpeakers,
        revenue,
        capacity: 1500,
        universities: universityResult.length,
    })
}
