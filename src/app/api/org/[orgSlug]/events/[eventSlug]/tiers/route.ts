import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgSlug: string; eventSlug: string }> }) {
    const { orgSlug, eventSlug } = await params
    const tiers = await prisma.ticketTier.findMany({
        where: { event: { slug: eventSlug, org: { slug: orgSlug } } },
        include: { _count: { select: { registrations: true } } }
    })
    
    return NextResponse.json(tiers.map(t => ({ 
        ...t, 
        sold: t._count.registrations,
        features: t.description ? t.description.split(',').map(s => s.trim()) : []
    })))
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ orgSlug: string; eventSlug: string }> }) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { orgSlug, eventSlug } = await params
    const body = await req.json()

    const event = await prisma.event.findFirst({
        where: { slug: eventSlug, org: { slug: orgSlug } }
    })
    
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const tier = await prisma.ticketTier.create({
        data: {
            eventId: event.id,
            name: body.name,
            code: body.name.toUpperCase().replace(/\s+/g, '_'),
            price: body.price,
            capacity: body.capacity,
            description: body.features.join(', '), // temporary store
        }
    })
    
    // Format back to UI expectations
    return NextResponse.json({
        ...tier,
        sold: 0,
        features: tier.description ? tier.description.split(',').map(s => s.trim()) : []
    })
}
