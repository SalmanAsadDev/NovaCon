import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createEventSchema = z.object({
    name: z.string().min(2, 'Event name must be at least 2 characters'),
    description: z.string().optional(),
    eventType: z.string().optional(),
    venue: z.string().optional(),
    city: z.string().optional(),
    startDate: z.string(),
    endDate: z.string(),
    capacity: z.number().int().positive().default(1000),
    isPublic: z.boolean().default(true),
})

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ orgSlug: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { orgSlug } = await params

        const membership = await prisma.orgMember.findFirst({
            where: {
                userId: session.user.id,
                org: { slug: orgSlug }
            },
            include: { org: true }
        })

        if (!membership || !['OWNER', 'EVENT_MANAGER'].includes(membership.role)) {
            return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 })
        }

        const body = await request.json()
        const result = createEventSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0]?.message || 'Invalid event parameters' },
                { status: 400 }
            )
        }

        const data = result.data

        // Generate unique slug
        let baseSlug = slugify(data.name)
        if (!baseSlug) baseSlug = 'event'
        let slug = baseSlug
        let counter = 1

        while (await prisma.event.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`
            counter++
        }

        const event = await prisma.event.create({
            data: {
                orgId: membership.org.id,
                name: data.name,
                slug,
                description: data.description,
                eventType: data.eventType || 'Conference',
                venue: data.venue,
                city: data.city,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                capacity: data.capacity,
                isPublic: data.isPublic,
                status: 'DRAFT',
                ticketTypes: {
                    createMany: {
                        data: [
                            { name: 'Standard Pass', code: 'STANDARD', price: 2500, capacity: Math.floor(data.capacity * 0.7) },
                            { name: 'VIP Pass', code: 'VIP', price: 7500, capacity: Math.floor(data.capacity * 0.3) },
                        ]
                    }
                }
            }
        })

        return NextResponse.json(event, { status: 201 })
    } catch (error: any) {
        console.error('Error creating event:', error)
        return NextResponse.json(
            { error: error?.message || 'Internal server error creating event' },
            { status: 500 }
        )
    }
}
