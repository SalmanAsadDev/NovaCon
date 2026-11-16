import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { requireOrgRole } from '@/lib/auth-helpers'

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ orgSlug: string; eventSlug: string; id: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { orgSlug, eventSlug, id } = await params

    const authResult = await requireOrgRole(session.user.id, orgSlug, ['OWNER', 'EVENT_MANAGER'])
    if (!authResult.authorized) return authResult.response

    const result = await prisma.ticketTier.deleteMany({
        where: { id, event: { slug: eventSlug, orgId: authResult.membership.orgId } },
    })

    if (result.count === 0) return NextResponse.json({ error: 'Tier not found' }, { status: 404 })
    return NextResponse.json({ success: true })
}
