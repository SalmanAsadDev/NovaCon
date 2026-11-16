import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireOrgRole } from '@/lib/auth-helpers'

const updateOrgSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens').optional(),
    description: z.string().max(500).optional().nullable(),
    website: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
    country: z.string().length(2, 'Country must be a 2-letter ISO code').optional(),
    currency: z.string().min(3).max(3, 'Currency must be a 3-letter ISO code').optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ orgSlug: string }> }) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { orgSlug } = await params

    const authResult = await requireOrgRole(session.user.id, orgSlug, ['OWNER', 'EVENT_MANAGER'])
    if (!authResult.authorized) return authResult.response

    const body = await req.json()
    const parsed = updateOrgSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    }

    try {
        const org = await prisma.organization.update({
            where: { slug: orgSlug },
            data: parsed.data,
        })
        return NextResponse.json(org)
    } catch (e: any) {
        if (e.code === 'P2002') return NextResponse.json({ error: 'Slug already taken' }, { status: 400 })
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }
}
