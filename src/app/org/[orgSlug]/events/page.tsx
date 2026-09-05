import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function OrgEventsPage({ params }: { params: Promise<{ orgSlug: string }> }) {
    const session = await auth()
    if (!session?.user) redirect('/login')

    const { orgSlug } = await params

    const membership = await prisma.orgMember.findFirst({
        where: {
            userId: session.user.id,
            org: { slug: orgSlug }
        },
        include: { org: true }
    })

    if (!membership) {
        redirect('/onboarding')
    }

    const events = await prisma.event.findMany({
        where: { orgId: membership.orgId },
        orderBy: { startDate: 'desc' },
        include: {
            _count: {
                select: { registrations: true, sessions: true, speakers: true }
            }
        }
    })

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                        Events
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage all events for {membership.org.name}</p>
                </div>
                {['OWNER', 'EVENT_MANAGER'].includes(membership.role) && (
                    <Link href={`/org/${orgSlug}/events/new`} className="btn btn-primary">
                        + Create Event
                    </Link>
                )}
            </div>

            {events.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📅</div>
                    <h3 style={{ fontSize: '20px', color: 'var(--text-primary)', marginBottom: '8px' }}>No events found</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Get started by creating your first event.</p>
                    {['OWNER', 'EVENT_MANAGER'].includes(membership.role) && (
                        <Link href={`/org/${orgSlug}/events/new`} className="btn btn-primary">
                            Create Event
                        </Link>
                    )}
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '24px'
                }}>
                    {events.map((event) => (
                        <Link key={event.id} href={`/org/${orgSlug}/events/${event.slug}/overview`} style={{ textDecoration: 'none' }}>
                            <div className="card" style={{ 
                                padding: '24px', 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        background: event.status === 'LIVE' ? 'rgba(0, 255, 128, 0.1)' : 'var(--bg-highlight)',
                                        color: event.status === 'LIVE' ? '#00ff80' : 'var(--text-secondary)',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        letterSpacing: '0.5px'
                                    }}>
                                        {event.status}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                                        {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                                
                                <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                                    {event.name}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', flex: 1 }}>
                                    {event.venue || 'No venue set'} • {event.city || 'No location set'}
                                </p>
                                
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '16px', 
                                    borderTop: '1px solid var(--border)', 
                                    paddingTop: '16px',
                                    color: 'var(--text-secondary)',
                                    fontSize: '13px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ color: 'var(--accent)' }}>≡</span>
                                        {event._count.registrations} Attendees
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ color: 'var(--accent)' }}>◉</span>
                                        {event._count.speakers} Speakers
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
