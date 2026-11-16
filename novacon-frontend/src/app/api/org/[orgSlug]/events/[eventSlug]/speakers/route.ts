import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireOrgRole } from '@/lib/auth-helpers'

const createSpeakerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    jobTitle: z.string().min(2, 'Job title is required'),
    track: z.string().min(1, 'Track is required'),
    bio: z.string().min(10, 'Bio must be at least 10 characters'),
    avatar: z.string().url().optional().or(z.literal('')),
})

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ orgSlug: string; eventSlug: string }> }
) {
    const { orgSlug, eventSlug } = await params
    const speakers = await prisma.speaker.findMany({
        where: { event: { slug: eventSlug, org: { slug: orgSlug } } },
        orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(speakers)
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
    const parsed = createSpeakerSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    }

    const event = await prisma.event.findFirst({
        where: { slug: eventSlug, orgId: authResult.membership.orgId },
    })
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const speaker = await prisma.speaker.create({
        data: {
            eventId: event.id,
            name: parsed.data.name,
            jobTitle: parsed.data.jobTitle,
            track: parsed.data.track,
            bio: parsed.data.bio,
            avatar: parsed.data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(parsed.data.name)}&background=random`,
        },
    })
    return NextResponse.json(speaker, { status: 201 })
}
