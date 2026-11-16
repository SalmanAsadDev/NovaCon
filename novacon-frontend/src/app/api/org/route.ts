import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createOrgSchema = z.object({
    name: z.string().min(2, 'Organization name must be at least 2 characters'),
    description: z.string().optional(),
})

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const result = createOrgSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0]?.message || 'Invalid organization data' },
                { status: 400 }
            )
        }

        const { name, description } = result.data

        // Generate a unique slug
        let baseSlug = slugify(name)
        if (!baseSlug) baseSlug = 'org'
        let slug = baseSlug
        let counter = 1

        while (await prisma.organization.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`
            counter++
        }

        // Create organization and assign creator as OWNER
        const organization = await prisma.organization.create({
            data: {
                name,
                slug,
                description,
                members: {
                    create: {
                        userId: session.user.id,
                        role: 'OWNER'
                    }
                }
            }
        })

        // Create a default initial draft event so the workspace is ready
        const defaultEventSlug = `${slug}-launch-${Date.now().toString().slice(-4)}`
        const startDate = new Date()
        startDate.setDate(startDate.getDate() + 30)
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 2)

        await prisma.event.create({
            data: {
                orgId: organization.id,
                name: `${name} Annual Conference`,
                slug: defaultEventSlug,
                status: 'DRAFT',
                startDate,
                endDate,
                venue: 'Main Convention Center',
                city: 'Islamabad',
                capacity: 500,
                isPublic: true,
                ticketTypes: {
                    createMany: {
                        data: [
                            { name: 'Standard Pass', code: 'STANDARD', price: 2500, capacity: 350 },
                            { name: 'VIP Pass', code: 'VIP', price: 7500, capacity: 150 },
                        ]
                    }
                }
            }
        })

        return NextResponse.json({
            id: organization.id,
            name: organization.name,
            slug: organization.slug
        }, { status: 201 })
    } catch (error: any) {
        console.error('Error creating organization:', error)
        return NextResponse.json(
            { error: error?.message || 'Internal server error creating organization' },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const memberships = await prisma.orgMember.findMany({
            where: { userId: session.user.id },
            include: {
                org: {
                    include: {
                        _count: {
                            select: { events: true, members: true }
                        }
                    }
                }
            }
        })

        const orgs = memberships.map(m => ({
            id: m.org.id,
            name: m.org.name,
            slug: m.org.slug,
            role: m.role,
            eventCount: m.org._count.events,
            memberCount: m.org._count.members
        }))

        return NextResponse.json({ organizations: orgs })
    } catch (error: any) {
        console.error('Error fetching organizations:', error)
        return NextResponse.json(
            { error: 'Internal server error fetching organizations' },
            { status: 500 }
        )
    }
}
