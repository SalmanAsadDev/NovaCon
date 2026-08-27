import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const registrationSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    university: z.string().min(2),
    track: z.string().min(1),
    ticketType: z.enum(['STANDARD', 'PREMIUM', 'WORKSHOP']),
})

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl
    const track = searchParams.get('track')
    const ticketType = searchParams.get('ticketType')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 10

    const where = {
        ...(track ? { track } : {}),
        ...(ticketType ? { ticketType: ticketType as any } : {}),
        ...(status ? { status: status as any } : {}),
        ...(search ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { university: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } },
            ],
        } : {}),
    }

    const [data, total] = await Promise.all([
        prisma.registration.findMany({
            where,
            orderBy: { registeredAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.registration.count({ where }),
    ])

    return NextResponse.json({ data, total, page, pages: Math.ceil(total / limit) })
}

export async function POST(request: NextRequest) {
    // Public endpoint — no auth required (self-registration)
    const body = await request.json()
    const parsed = registrationSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    // Check duplicate email
    const existing = await prisma.registration.findFirst({
        where: { email: parsed.data.email },
    })
    if (existing) {
        return NextResponse.json(
            { error: 'This email is already registered.' },
            { status: 409 }
        )
    }

    const reg = await prisma.registration.create({ data: parsed.data })
    return NextResponse.json(reg, { status: 201 })
}
