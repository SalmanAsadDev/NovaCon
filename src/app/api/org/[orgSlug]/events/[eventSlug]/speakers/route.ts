import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgSlug: string; eventSlug: string }> }) {
    const { orgSlug, eventSlug } = await params
    const speakers = await prisma.speaker.findMany({
        where: { event: { slug: eventSlug, org: { slug: orgSlug } } },
        orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(speakers)
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

    const speaker = await prisma.speaker.create({
        data: {
            eventId: event.id,
            name: body.name,
            jobTitle: body.jobTitle,
            track: body.track,
            bio: body.bio,
            avatar: body.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(body.name)}&background=random`
        }
    })
    return NextResponse.json(speaker)
}
