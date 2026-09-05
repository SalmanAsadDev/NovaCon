import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { id } = await params
    const body = await req.json()

    try {
        const speaker = await prisma.speaker.update({
            where: { id },
            data: {
                name: body.name,
                jobTitle: body.jobTitle,
                track: body.track,
                bio: body.bio,
                avatar: body.avatar
            }
        })
        return NextResponse.json(speaker)
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { id } = await params
    await prisma.speaker.delete({ where: { id } })
    return NextResponse.json({ success: true })
}
