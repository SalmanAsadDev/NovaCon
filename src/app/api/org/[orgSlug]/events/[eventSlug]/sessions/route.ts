import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgSlug: string; eventSlug: string }> }) {
    const { orgSlug, eventSlug } = await params
    const sessions = await prisma.session.findMany({
        where: { event: { slug: eventSlug, org: { slug: orgSlug } } },
        include: { speaker: { select: { id: true, name: true } } },
        orderBy: [{ day: 'asc' }, { time: 'asc' }]
    })
    return NextResponse.json(sessions)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ orgSlug: string; eventSlug: string }> }) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { orgSlug, eventSlug } = await params
    const body = await req.json()

    const event = await prisma.event.findFirst({
        where: { slug: eventSlug, org: { slug: orgSlug } }
    })
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const newSession = await prisma.session.create({
        data: {
            eventId: event.id,
            title: body.title,
            track: body.track,
            venue: body.venue,
            day: body.day,
            time: body.time,
            durationMin: body.durationMin,
            capacity: body.capacity,
            speakerId: body.speakerId || null
        }
    })
    return NextResponse.json(newSession)
}
