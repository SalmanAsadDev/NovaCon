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
    })
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const [byTrackRaw, byUniversityRaw, byTicketRaw, dayStats] = await Promise.all([
        prisma.registration.groupBy({
            by: ['track'],
            _count: { id: true },
            where: { eventId: event.id },
        }),
        prisma.registration.groupBy({
            by: ['university'],
            _count: { id: true },
            where: { eventId: event.id },
        }),
        prisma.registration.groupBy({
            by: ['ticketType'],
            _count: { id: true },
            where: { eventId: event.id },
        }),
        prisma.registrationDayStat.findMany({ orderBy: { date: 'asc' } }),
    ])

    return NextResponse.json({
        byTrack: byTrackRaw.map(r => ({ name: r.track, count: r._count.id })),
        byUniversity: byUniversityRaw.map(r => ({ name: r.university, count: r._count.id })),
        byTicket: byTicketRaw.map(r => ({ name: r.ticketType, count: r._count.id })),
        registrationsByDay: dayStats.map(d => ({ date: d.date, count: d.count })),
    })
}
