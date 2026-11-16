import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireOrgRole } from '@/lib/auth-helpers'

const createSessionSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    track: z.string().min(1, 'Track is required'),
    venue: z.string().min(1, 'Venue is required'),
    day: z.number().int().positive('Day must be a positive integer'),
    time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    durationMin: z.number().int().positive('Duration must be positive'),
    capacity: z.number().int().positive('Capacity must be positive'),
    speakerId: z.string().cuid().optional().nullable(),
})

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ orgSlug: string; eventSlug: string }> }
) {
    const { orgSlug, eventSlug } = await params
    const sessions = await prisma.session.findMany({
        where: { event: { slug: eventSlug, org: { slug: orgSlug } } },
        include: { speaker: { select: { id: true, name: true } } },
        orderBy: [{ day: 'asc' }, { time: 'asc' }],
    })
    return NextResponse.json(sessions)
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ orgSlug: string; eventSlug: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { orgSlug, eventSlug } = await params

    const authResult = await requireOrgRole(session.user.id, orgSlug, ['OWNER', 'EVENT_MANAGER', 'EVENT_PLANNER'])
    if (!authResult.authorized) return authResult.response

    const body = await req.json()
    const parsed = createSessionSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    }

    const event = await prisma.event.findFirst({
        where: { slug: eventSlug, orgId: authResult.membership.orgId },
    })
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const newSession = await prisma.session.create({
        data: {
            eventId: event.id,
            title: parsed.data.title,
            track: parsed.data.track,
            venue: parsed.data.venue,
            day: parsed.data.day,
            time: parsed.data.time,
            durationMin: parsed.data.durationMin,
            capacity: parsed.data.capacity,
            speakerId: parsed.data.speakerId ?? null,
        },
    })
    return NextResponse.json(newSession, { status: 201 })
}
