import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireOrgRole } from '@/lib/auth-helpers'

const createTierSchema = z.object({
    name: z.string().min(1, 'Tier name is required'),
    price: z.number().min(0, 'Price must be non-negative'),
    capacity: z.number().int().positive('Capacity must be a positive integer'),
    features: z.array(z.string().min(1)).default([]),
    currency: z.string().length(3).default('PKR'),
})

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ orgSlug: string; eventSlug: string }> }
) {
    const { orgSlug, eventSlug } = await params
    const tiers = await prisma.ticketTier.findMany({
        where: { event: { slug: eventSlug, org: { slug: orgSlug } } },
        include: { _count: { select: { registrations: true } } },
    })

    return NextResponse.json(
        tiers.map(t => ({
            ...t,
            sold: t._count.registrations,
            features: t.description ? t.description.split(',').map(s => s.trim()) : [],
        }))
    )
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ orgSlug: string; eventSlug: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { orgSlug, eventSlug } = await params

    const authResult = await requireOrgRole(session.user.id, orgSlug, ['OWNER', 'EVENT_MANAGER'])
    if (!authResult.authorized) return authResult.response

    const body = await req.json()
    const parsed = createTierSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    }

    const event = await prisma.event.findFirst({
        where: { slug: eventSlug, orgId: authResult.membership.orgId },
    })
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const tier = await prisma.ticketTier.create({
        data: {
            eventId: event.id,
            name: parsed.data.name,
            code: parsed.data.name.toUpperCase().replace(/\s+/g, '_'),
            price: parsed.data.price,
            capacity: parsed.data.capacity,
            currency: parsed.data.currency,
            description: parsed.data.features.join(', '),
        },
    })

    return NextResponse.json(
        { ...tier, sold: 0, features: parsed.data.features },
        { status: 201 }
    )
}
