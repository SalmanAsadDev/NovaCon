import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    const [byTrackRaw, byUniversityRaw, byTicketRaw, dayStats] = await Promise.all([
        prisma.registration.groupBy({ by: ['track'], _count: { id: true } }),
        prisma.registration.groupBy({ by: ['university'], _count: { id: true } }),
        prisma.registration.groupBy({ by: ['ticketType'], _count: { id: true } }),
        prisma.registrationDayStat.findMany({ orderBy: { date: 'asc' } }),
    ])

    return NextResponse.json({
        byTrack: byTrackRaw.map(r => ({ name: r.track, count: r._count.id })),
        byUniversity: byUniversityRaw.map(r => ({ name: r.university, count: r._count.id })),
        byTicket: byTicketRaw.map(r => ({ name: r.ticketType, count: r._count.id })),
        registrationsByDay: dayStats.map(d => ({ date: d.date, count: d.count })),
    })
}
