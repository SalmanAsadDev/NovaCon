import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireOrgRole } from '@/lib/auth-helpers'
import { OrgRole, EventStatus } from '@prisma/client'

export async function GET(_req: Request, { params }: { params: Promise<{ orgSlug: string }> }) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { orgSlug } = await params
    const authResult = await requireOrgRole(session.user.id, orgSlug, [
        OrgRole.OWNER, OrgRole.EVENT_MANAGER, OrgRole.EVENT_PLANNER, OrgRole.FINANCE, OrgRole.STAFF,
    ])
    if (!authResult.authorized) return authResult.response

    const orgId = authResult.membership.orgId

    const [
        org,
        totalEvents,
        draftEvents,
        liveEvents,
        completedEvents,
        totalRegistrations,
        revenueRows,
        upcoming,
    ] = await Promise.all([
        prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } }),
        prisma.event.count({ where: { orgId } }),
        prisma.event.count({ where: { orgId, status: EventStatus.DRAFT } }),
        prisma.event.count({ where: { orgId, status: EventStatus.LIVE } }),
        prisma.event.count({ where: { orgId, status: EventStatus.COMPLETED } }),
        prisma.registration.count({ where: { event: { orgId } } }),
        prisma.registration.findMany({
            where: { event: { orgId }, status: { not: 'CANCELLED' } },
            select: { ticketTier: { select: { price: true } } },
        }),
        prisma.event.findMany({
            where: { orgId, startDate: { gte: new Date() } },
            orderBy: { startDate: 'asc' },
            take: 5,
            select: {
                id: true, name: true, slug: true, startDate: true, status: true,
                _count: { select: { registrations: true } },
            },
        }),
    ])

    const recentRevenue = revenueRows.reduce(
        (sum, r) => sum + (r.ticketTier ? Number(r.ticketTier.price) : 0),
        0
    )

    return NextResponse.json({
        orgName: org?.name ?? orgSlug,
        userName: session.user.name ?? 'there',
        totalEvents,
        draftEvents,
        liveEvents,
        completedEvents,
        totalRegistrations,
        recentRevenue,
        upcomingEvents: upcoming.map(e => ({
            id: e.id,
            name: e.name,
            slug: e.slug,
            startDate: e.startDate,
            status: e.status,
            registrationCount: e._count.registrations,
        })),
    })
}
