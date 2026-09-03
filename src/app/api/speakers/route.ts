import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const speakerSchema = z.object({
    name: z.string().min(2),
    jobTitle: z.string().min(2),
    track: z.string().min(1),
    bio: z.string().min(10),
    avatar: z.string().max(3),
})

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl
    const track = searchParams.get('track')

    const speakers = await prisma.speaker.findMany({
        where: track ? { track } : {},
        include: { sessions: { select: { id: true, title: true, track: true } } },
        orderBy: { name: 'asc' },
    })

    return NextResponse.json(speakers)
}

export async function POST(request: NextRequest) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = speakerSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const newSpeaker = await prisma.speaker.create({ data: parsed.data })
    return NextResponse.json(newSpeaker, { status: 201 })
}
