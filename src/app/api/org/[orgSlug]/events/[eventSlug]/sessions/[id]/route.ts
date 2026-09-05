import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { id } = await params
    const body = await req.json()

    try {
        const updated = await prisma.session.update({
            where: { id },
            data: {
                title: body.title,
                track: body.track,
                venue: body.venue,
                day: body.day,
                time: body.time,
                durationMin: body.durationMin,
                capacity: body.capacity,
                speakerId: body.speakerId || null
            }
        })
        return NextResponse.json(updated)
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { id } = await params
    await prisma.session.delete({ where: { id } })
    return NextResponse.json({ success: true })
}
