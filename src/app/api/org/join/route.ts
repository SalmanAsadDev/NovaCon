import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const joinOrgSchema = z.object({
    token: z.string().min(1, 'Invite code is required'),
})

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const result = joinOrgSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0]?.message || 'Invalid code' },
                { status: 400 }
            )
        }

        const { token } = result.data

        const invitation = await prisma.orgInvitation.findUnique({
            where: { token }
        })

        if (!invitation) {
            return NextResponse.json(
                { error: 'Invalid invitation code' },
                { status: 404 }
            )
        }

        if (invitation.acceptedAt) {
            return NextResponse.json(
                { error: 'This invitation code has already been used' },
                { status: 400 }
            )
        }

        if (new Date() > invitation.expiresAt) {
            return NextResponse.json(
                { error: 'This invitation code has expired' },
                { status: 400 }
            )
        }

        // Get the organization
        const org = await prisma.organization.findUnique({
            where: { id: invitation.orgId }
        })

        if (!org) {
            return NextResponse.json(
                { error: 'Organization no longer exists' },
                { status: 404 }
            )
        }

        // Upsert or create membership
        await prisma.orgMember.upsert({
            where: {
                orgId_userId: {
                    orgId: invitation.orgId,
                    userId: session.user.id
                }
            },
            create: {
                orgId: invitation.orgId,
                userId: session.user.id,
                role: invitation.role
            },
            update: {
                role: invitation.role
            }
        })

        // Mark invitation as accepted
        await prisma.orgInvitation.update({
            where: { id: invitation.id },
            data: { acceptedAt: new Date() }
        })

        return NextResponse.json({
            slug: org.slug,
            name: org.name
        })
    } catch (error: any) {
        console.error('Error joining organization:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to join organization' },
            { status: 500 }
        )
    }
}
