import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const reg = await prisma.registration.findUnique({ where: { id } })
    if (!reg) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(reg)
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
    await prisma.registration.delete({ where: { id } })
    return NextResponse.json({ success: true })
}
