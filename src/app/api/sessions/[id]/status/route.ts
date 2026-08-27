import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { SessionStatus } from '@prisma/client'

const STATUS_CYCLE: SessionStatus[] = ['UPCOMING', 'LIVE', 'FULL', 'ENDED']

export async function PATCH(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authSession = await auth()
    // @ts-expect-error custom role
    if (authSession?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const session = await prisma.session.findUnique({ where: { id } })
    if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const currentIdx = STATUS_CYCLE.indexOf(session.status)
    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length]

    const updated = await prisma.session.update({
        where: { id },
        data: { status: nextStatus },
    })
    return NextResponse.json(updated)
}
