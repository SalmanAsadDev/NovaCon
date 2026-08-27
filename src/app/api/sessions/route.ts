import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const sessionSchema = z.object({
    title: z.string().min(3),
    track: z.string().min(1),
    venue: z.string().min(1),
    day: z.number().int().min(1).max(3),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    durationMin: z.number().int().positive(),
    capacity: z.number().int().positive(),
    registered: z.number().int().min(0).optional(),
    status: z.enum(['UPCOMING', 'LIVE', 'FULL', 'ENDED']).optional(),
    speakerId: z.string().optional().nullable(),
})

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl
    const track = searchParams.get('track')
    const day = searchParams.get('day')
    const status = searchParams.get('status')

    const sessions = await prisma.session.findMany({
        where: {
            ...(track ? { track } : {}),
            ...(day ? { day: parseInt(day) } : {}),
            ...(status ? { status: status as any } : {}),
        },
        include: { speaker: true },
        orderBy: [{ day: 'asc' }, { time: 'asc' }],
    })

    return NextResponse.json(sessions)
}

export async function POST(request: NextRequest) {
    const session = await auth()
    // @ts-expect-error custom role
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = sessionSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const newSession = await prisma.session.create({ data: parsed.data as any })
    return NextResponse.json(newSession, { status: 201 })
}
