import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateSchema = z.object({
    title: z.string().min(3).optional(),
    track: z.string().optional(),
    venue: z.string().optional(),
    day: z.number().int().min(1).max(3).optional(),
    time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    durationMin: z.number().int().positive().optional(),
    capacity: z.number().int().positive().optional(),
    registered: z.number().int().min(0).optional(),
    status: z.enum(['UPCOMING', 'LIVE', 'FULL', 'ENDED']).optional(),
    speakerId: z.string().optional().nullable(),
})

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const session = await prisma.session.findUnique({
        where: { id },
        include: { speaker: true },
    })
    if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(session)
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authSession = await auth()
    if (authSession?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const updated = await prisma.session.update({
        where: { id },
        data: parsed.data as any,
        include: { speaker: true },
    })
    return NextResponse.json(updated)
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authSession = await auth()
    if (authSession?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await prisma.session.delete({ where: { id } })
    return NextResponse.json({ success: true })
}
