import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventSlug: string }> }) {
    const { eventSlug } = await params
    const body = await req.json()

    try {
        const event = await prisma.event.findUnique({
            where: { slug: eventSlug }
        })

        if (!event || event.status !== 'LIVE') {
            return NextResponse.json({ error: 'Ticket sales are not open for this event.' }, { status: 400 })
        }

        const tier = await prisma.ticketTier.findUnique({
            where: { id: body.ticketTierId }
        })

        if (!tier || tier.eventId !== event.id || !tier.isActive) {
            return NextResponse.json({ error: 'Invalid ticket tier.' }, { status: 400 })
        }

        const quantity = Math.min(Number(body.quantity) || 1, 10)

        // Check capacity
        if (tier.capacity) {
            const soldCount = await prisma.registration.count({
                where: { ticketTierId: tier.id }
            })
            if (soldCount + quantity > tier.capacity) {
                return NextResponse.json({ error: `Only ${tier.capacity - soldCount} tickets left for this tier.` }, { status: 400 })
            }
        }

        // Create multiple registrations
        const registrationsData = Array.from({ length: quantity }).map(() => ({
            eventId: event.id,
            name: body.name,
            email: body.email,
            phone: body.phone,
            university: body.university,
            track: body.track || 'General',
            ticketTierId: tier.id,
            ticketType: tier.code,
            status: 'REGISTERED' as any
        }))

        await prisma.registration.createMany({
            data: registrationsData
        })

        return NextResponse.json({ success: true, count: quantity })

    } catch (e: any) {
        console.error('Registration Error:', e)
        return NextResponse.json({ error: 'An unexpected error occurred during registration.' }, { status: 500 })
    }
}
