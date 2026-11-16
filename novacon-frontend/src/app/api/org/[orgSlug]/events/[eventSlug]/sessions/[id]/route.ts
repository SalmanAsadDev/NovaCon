import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireOrgRole } from '@/lib/auth-helpers'

const updateSessionSchema = z.object({
    title: z.string().min(2).optional(),
    track: z.string().min(1).optional(),
    venue: z.string().min(1).optional(),
    day: z.number().int().positive().optional(),
    time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    durationMin: z.number().int().positive().optional(),
    capacity: z.number().int().positive().optional(),
    speakerId: z.string().cuid().optional().nullable(),
    status: z.enum(['UPCOMING', 'LIVE', 'FULL', 'ENDED']).optional(),
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
    const parsed = updateSessionSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    }

    const existing = await prisma.session.findFirst({
        where: { id, event: { slug: eventSlug, orgId: authResult.membership.orgId } },
    })
    if (!existing) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    const updated = await prisma.session.update({
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

    const result = await prisma.session.deleteMany({
        where: { id, event: { slug: eventSlug, orgId: authResult.membership.orgId } },
    })

    if (result.count === 0) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    return NextResponse.json({ success: true })
}
