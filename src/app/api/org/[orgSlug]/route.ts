import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ orgSlug: string }> }) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { orgSlug } = await params
    const body = await req.json()

    const membership = await prisma.orgMember.findFirst({
        where: { userId: session.user.id, org: { slug: orgSlug } }
    })

    if (!membership || !['OWNER', 'EVENT_MANAGER'].includes(membership.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const org = await prisma.organization.update({
            where: { slug: orgSlug },
            data: {
                name: body.name,
                slug: body.slug,
                description: body.description,
                website: body.website,
                country: body.country,
                currency: body.currency
            }
        })

        return NextResponse.json(org)
    } catch (e: any) {
        if (e.code === 'P2002') return NextResponse.json({ error: 'Slug already taken' }, { status: 400 })
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }
}
