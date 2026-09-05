import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Search, Users } from 'lucide-react'

export default async function AttendeesPage({ params }: { params: Promise<{ orgSlug: string; eventSlug: string }> }) {
    const session = await auth()
    if (!session?.user) redirect('/login')

    const { orgSlug, eventSlug } = await params

    const event = await prisma.event.findFirst({
        where: { slug: eventSlug, org: { slug: orgSlug } }
    })

    if (!event) redirect(`/org/${orgSlug}/events`)

    const attendees = await prisma.registration.findMany({
        where: { eventId: event.id },
        include: { ticketTier: true },
        orderBy: { registeredAt: 'desc' }
    })

    return (
        <div className="page-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                        Attendees
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {attendees.length} people registered for this event
                    </p>
                </div>
                <button className="btn btn-primary">Export CSV</button>
            </div>

            {attendees.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.3, color: 'var(--text-muted)' }} />
                    <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>No attendees yet</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Once people register, they will appear here.</p>
                </div>
            ) : (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Name', 'Email', 'Ticket Type', 'Registration Date', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {attendees.map(a => (
                                <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 500 }}>{a.name}</td>
                                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{a.email}</td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'var(--bg-highlight)', fontSize: '12px' }}>
                                            {a.ticketTier?.name || 'Standard'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                                        {new Date(a.registeredAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(0, 255, 128, 0.1)', color: '#00ff80', fontSize: '12px' }}>
                                            {a.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
