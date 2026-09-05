import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ orgSlug: string; eventSlug: string }> }) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { orgSlug, eventSlug } = await params
    const body = await req.json()

    const membership = await prisma.orgMember.findFirst({
        where: { userId: session.user.id, org: { slug: orgSlug } }
    })

    if (!membership || !['OWNER', 'EVENT_MANAGER'].includes(membership.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const updated = await prisma.event.update({
            where: { slug: eventSlug },
            data: {
                name: body.name,
                slug: body.slug,
                description: body.description,
                eventType: body.eventType,
                status: body.status,
                startDate: body.startDate,
                endDate: body.endDate,
                venue: body.venue,
                city: body.city,
                country: body.country,
                expectedAttendees: body.expectedAttendees,
                isPublic: body.isPublic
            }
        })
        return NextResponse.json(updated)
    } catch (e: any) {
        if (e.code === 'P2002') return NextResponse.json({ error: 'Slug already taken' }, { status: 400 })
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }
}
