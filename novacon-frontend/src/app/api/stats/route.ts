import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireOrgRole } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = req.nextUrl
    const orgSlug = searchParams.get('orgSlug')
    const eventSlug = searchParams.get('eventSlug')

    if (!orgSlug || !eventSlug) {
        return NextResponse.json(
            { error: 'orgSlug and eventSlug query parameters are required' },
            { status: 400 }
        )
    }

    const authResult = await requireOrgRole(session.user.id, orgSlug)
    if (!authResult.authorized) return authResult.response

    const event = await prisma.event.findFirst({
        where: { slug: eventSlug, orgId: authResult.membership.orgId },
        include: { ticketTypes: { select: { id: true, price: true, code: true } } },
    })
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const [
        totalRegistrations,
        checkedIn,
        sessionsLive,
        totalSessions,
        totalSpeakers,
        universityResult,
        revenueRows,
    ] = await Promise.all([
        prisma.registration.count({ where: { eventId: event.id } }),
        prisma.registration.count({ where: { eventId: event.id, status: 'CHECKED_IN' } }),
        prisma.session.count({ where: { eventId: event.id, status: 'LIVE' } }),
        prisma.session.count({ where: { eventId: event.id } }),
        prisma.speaker.count({ where: { eventId: event.id } }),
        prisma.registration.groupBy({ by: ['university'], where: { eventId: event.id } }),
        // Sum revenue from actual TicketTier prices via relation join
        prisma.registration.findMany({
            where: { eventId: event.id, status: { not: 'CANCELLED' } },
            select: { ticketTier: { select: { price: true } } },
        }),
    ])

    const revenue = revenueRows.reduce(
        (sum, r) => sum + (r.ticketTier ? Number(r.ticketTier.price) : 0),
        0
    )

    return NextResponse.json({
        totalRegistrations,
        checkedIn,
        sessionsLive,
        totalSessions,
        totalSpeakers,
        revenue,
        capacity: event.capacity,
        universities: universityResult.length,
    })
}
