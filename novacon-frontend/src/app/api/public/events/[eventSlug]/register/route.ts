import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('A valid email address is required'),
    phone: z.string().optional(),
    university: z.string().min(2, 'Institution / university is required'),
    track: z.string().min(1, 'Track selection is required'),
    ticketTierId: z.string().cuid('Invalid ticket tier'),
    quantity: z.number().int().min(1).max(10).default(1),
})

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ eventSlug: string }> }
) {
    const { eventSlug } = await params

    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message },
            { status: 400 }
        )
    }

    const { name, email, phone, university, track, ticketTierId, quantity } = parsed.data

    try {
        const result = await prisma.$transaction(async (tx) => {
            const event = await tx.event.findUnique({ where: { slug: eventSlug } })
            if (!event || event.status !== 'LIVE') {
                throw new RegistrationError('Ticket sales are not open for this event.', 400)
            }

            const tier = await tx.ticketTier.findUnique({ where: { id: ticketTierId } })
            if (!tier || tier.eventId !== event.id || !tier.isActive) {
                throw new RegistrationError('Invalid ticket tier.', 400)
            }

            if (tier.capacity !== null) {
                const soldCount = await tx.registration.count({
                    where: { ticketTierId: tier.id, status: { not: 'CANCELLED' } },
                })
                if (soldCount + quantity > tier.capacity) {
                    const remaining = tier.capacity - soldCount
                    throw new RegistrationError(
                        remaining > 0
                            ? `Only ${remaining} ticket${remaining === 1 ? '' : 's'} left for this tier.`
                            : 'This ticket tier is sold out.',
                        400
                    )
                }
            }

            const registrationsData = Array.from({ length: quantity }).map(() => ({
                eventId: event.id,
                name,
                email,
                phone: phone ?? null,
                university,
                track,
                ticketTierId: tier.id,
                ticketType: tier.code,
                status: 'REGISTERED' as const,
            }))

            await tx.registration.createMany({ data: registrationsData })
            return { count: quantity, tierName: tier.name }
        })

        return NextResponse.json({ success: true, count: result.count, tier: result.tierName })
    } catch (e: any) {
        if (e instanceof RegistrationError) {
            return NextResponse.json({ error: e.message }, { status: e.statusCode })
        }
        console.error('Registration error:', e)
        return NextResponse.json({ error: 'An unexpected error occurred during registration.' }, { status: 500 })
    }
}

class RegistrationError extends Error {
    constructor(message: string, public statusCode: number) {
        super(message)
        this.name = 'RegistrationError'
    }
}
