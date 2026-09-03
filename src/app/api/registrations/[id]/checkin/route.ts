import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authSession = await auth()
    if (authSession?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const reg = await prisma.registration.findUnique({ where: { id } })
    if (!reg) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updated = await prisma.registration.update({
        where: { id },
        data: { status: 'CHECKED_IN' },
    })
    return NextResponse.json(updated)
}
