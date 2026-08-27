import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    // Returns last 10 activity events (registrations + check-ins) for live ticker
    const [recentRegistrations, recentCheckins] = await Promise.all([
        prisma.registration.findMany({
            orderBy: { registeredAt: 'desc' },
            take: 5,
            select: { name: true, university: true, track: true, registeredAt: true },
        }),
        prisma.registration.findMany({
            where: { status: 'CHECKED_IN' },
            orderBy: { updatedAt: 'desc' },
            take: 5,
            select: { name: true, university: true, updatedAt: true },
        }),
    ])

    const events = [
        ...recentRegistrations.map(r => ({
            type: 'registration',
            message: `${r.name} from ${r.university} registered for ${r.track} track`,
            timestamp: r.registeredAt,
        })),
        ...recentCheckins.map(r => ({
            type: 'checkin',
            message: `${r.name} from ${r.university} checked in`,
            timestamp: r.updatedAt,
        })),
    ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)

    return NextResponse.json(events)
}
