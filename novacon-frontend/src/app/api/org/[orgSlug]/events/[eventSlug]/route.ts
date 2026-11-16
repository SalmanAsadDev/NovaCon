import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireOrgRole } from '@/lib/auth-helpers'

const updateEventSchema = z.object({
    name: z.string().min(2, 'Event name must be at least 2 characters').optional(),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens').optional(),
    description: z.string().max(2000).optional().nullable(),
    eventType: z.string().optional().nullable(),
    status: z.enum(['DRAFT', 'PLANNING', 'PUBLISHED', 'LIVE', 'COMPLETED', 'CANCELLED', 'ARCHIVED']).optional(),
    startDate: z.string().datetime({ offset: true }).optional(),
    endDate: z.string().datetime({ offset: true }).optional(),
    venue: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    country: z.string().length(2).optional(),
    expectedAttendees: z.number().int().positive().optional().nullable(),
    capacity: z.number().int().positive().optional(),
    isPublic: z.boolean().optional(),
})

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ orgSlug: string; eventSlug: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { orgSlug, eventSlug } = await params

    const authResult = await requireOrgRole(session.user.id, orgSlug, ['OWNER', 'EVENT_MANAGER'])
    if (!authResult.authorized) return authResult.response

    const body = await req.json()
    const parsed = updateEventSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    }

    try {
        // Scope the update to the specific org to prevent cross-org mutation
        const updated = await prisma.event.update({
            where: { slug: eventSlug, orgId: authResult.membership.orgId },
            data: parsed.data,
        })
        return NextResponse.json(updated)
    } catch (e: any) {
        if (e.code === 'P2025') return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        if (e.code === 'P2002') return NextResponse.json({ error: 'Slug already taken' }, { status: 400 })
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }
}
