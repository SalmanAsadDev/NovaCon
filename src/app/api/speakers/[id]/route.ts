import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateSchema = z.object({
    name: z.string().min(2).optional(),
    jobTitle: z.string().min(2).optional(),
    track: z.string().optional(),
    bio: z.string().min(10).optional(),
    avatar: z.string().max(3).optional(),
})

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const speaker = await prisma.speaker.findUnique({
        where: { id },
        include: { sessions: true },
    })
    if (!speaker) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(speaker)
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authSession = await auth()
    // @ts-expect-error custom role
    if (authSession?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const updated = await prisma.speaker.update({
        where: { id },
        data: parsed.data,
    })
    return NextResponse.json(updated)
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authSession = await auth()
    // @ts-expect-error custom role
    if (authSession?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    // Detach sessions first
    await prisma.session.updateMany({
        where: { speakerId: id },
        data: { speakerId: null },
    })
    await prisma.speaker.delete({ where: { id } })
    return NextResponse.json({ success: true })
}
