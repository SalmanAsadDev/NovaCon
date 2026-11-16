import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AttendeesClient, { Attendee } from './AttendeesClient'

export default async function AttendeesPage({ params }: { params: Promise<{ orgSlug: string; eventSlug: string }> }) {
    const session = await auth()
    if (!session?.user) redirect('/login')

    const { orgSlug, eventSlug } = await params

    const event = await prisma.event.findFirst({
        where: { slug: eventSlug, org: { slug: orgSlug } },
        select: { id: true, capacity: true },
    })

    if (!event) redirect(`/org/${orgSlug}/events`)

    const rows = await prisma.registration.findMany({
        where: { eventId: event.id },
        include: { ticketTier: { select: { name: true } } },
        orderBy: { registeredAt: 'desc' },
    })

    const attendees: Attendee[] = rows.map(a => ({
        id: a.id,
        name: a.name,
        email: a.email,
        status: a.status,
        registeredAt: a.registeredAt.toISOString(),
        ticketTierName: a.ticketTier?.name ?? null,
    }))

    return <AttendeesClient attendees={attendees} capacity={event.capacity} />
}
