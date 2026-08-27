import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
    const authSession = await auth()
    // @ts-expect-error custom role
    if (authSession?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const registrations = await prisma.registration.findMany({
        orderBy: { registeredAt: 'asc' },
    })

    const TICKET_PRICES: Record<string, number> = {
        STANDARD: 2500,
        PREMIUM: 5000,
        WORKSHOP: 3500,
    }

    const headers = ['ID', 'Name', 'Email', 'University', 'Track', 'Ticket Type', 'Status', 'Registered At']
    const rows = registrations.map(r => [
        r.id,
        r.name,
        r.email,
        r.university,
        r.track,
        r.ticketType,
        r.status,
        r.registeredAt.toISOString(),
    ])

    const csv = [headers, ...rows]
        .map(row => row.map(v => `"${v}"`).join(','))
        .join('\n')

    return new Response(csv, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="novacon-registrations-${new Date().toISOString().split('T')[0]}.csv"`,
        },
    })
}
