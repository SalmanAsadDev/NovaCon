import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireOrgRole } from '@/lib/auth-helpers'

const updateSpeakerSchema = z.object({
    name: z.string().min(2).optional(),
    jobTitle: z.string().min(2).optional(),
    track: z.string().min(1).optional(),
    bio: z.string().min(10).optional(),
    avatar: z.string().url().optional().or(z.literal('')),
})

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ orgSlug: string; eventSlug: string; id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { orgSlug, eventSlug, id } = await params

    const authResult = await requireOrgRole(session.user.id, orgSlug, ['OWNER', 'EVENT_MANAGER', 'EVENT_PLANNER'])
    if (!authResult.authorized) return authResult.response

    const body = await req.json()
    const parsed = updateSpeakerSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    }

    // Confirm the speaker belongs to this org's event before mutating
    const existing = await prisma.speaker.findFirst({
        where: { id, event: { slug: eventSlug, orgId: authResult.membership.orgId } },
    })
    if (!existing) return NextResponse.json({ error: 'Speaker not found' }, { status: 404 })

    const updated = await prisma.speaker.update({
        where: { id },
        data: parsed.data,
    })
    return NextResponse.json(updated)
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ orgSlug: string; eventSlug: string; id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { orgSlug, eventSlug, id } = await params

    const authResult = await requireOrgRole(session.user.id, orgSlug, ['OWNER', 'EVENT_MANAGER', 'EVENT_PLANNER'])
    if (!authResult.authorized) return authResult.response

    // deleteMany with org scoping returns count 0 if the record doesn't belong to this org/event
    const result = await prisma.speaker.deleteMany({
        where: { id, event: { slug: eventSlug, orgId: authResult.membership.orgId } },
    })

    if (result.count === 0) return NextResponse.json({ error: 'Speaker not found' }, { status: 404 })
    return NextResponse.json({ success: true })
}
