import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import EventSettingsForm from './EventSettingsForm'

export default async function EventSettingsPage({ params }: { params: Promise<{ orgSlug: string; eventSlug: string }> }) {
    const session = await auth()
    if (!session?.user) redirect('/login')

    const { orgSlug, eventSlug } = await params

    const event = await prisma.event.findFirst({
        where: { slug: eventSlug, org: { slug: orgSlug } }
    })

    if (!event) redirect(`/org/${orgSlug}/events`)

    return (
        <div className="page-fade">
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Event Settings
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Manage details and configuration for {event.name}
                </p>
            </div>
            <EventSettingsForm event={event} orgSlug={orgSlug} />
        </div>
    )
}
