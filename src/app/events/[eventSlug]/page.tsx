import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Calendar, MapPin, Users, Clock, Building2 } from 'lucide-react'
import RegistrationModal from '@/components/events/RegistrationModal'

export default async function PublicEventPage({ params }: { params: Promise<{ eventSlug: string }> }) {
    const { eventSlug } = await params
    
    const event = await prisma.event.findUnique({
        where: { slug: eventSlug },
        include: {
            org: true,
            speakers: true,
            ticketTypes: { where: { isActive: true } },
            sessions: {
                include: { speaker: true },
                orderBy: [{ day: 'asc' }, { time: 'asc' }]
            }
        }
    })

    if (!event || !event.isPublic || !['PUBLISHED', 'LIVE', 'UPCOMING'].includes(event.status)) {
        notFound()
    }

    const startDate = new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    const endDate = new Date(event.endDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    const isSingleDay = startDate === endDate

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
            {/* Hero Section */}
            <div style={{ position: 'relative', background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, var(--accent-dim) 0%, transparent 70%)', opacity: 0.5 }} />
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px 60px', position: 'relative', zIndex: 10 }}>
                    <div className="badge badge-upcoming" style={{ marginBottom: '16px' }}>{event.eventType?.toUpperCase() || 'EVENT'}</div>
                    <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px', letterSpacing: '-1px' }}>
                        {event.name}
                    </h1>
                    
                    <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', marginBottom: '32px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={18} className="text-accent" style={{ color: 'var(--accent)' }} />
                            <span>{startDate}{!isSingleDay && ` - ${endDate}`}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={18} className="text-accent" style={{ color: 'var(--accent)' }} />
                            <span>{event.venue || 'TBA'}, {event.city || event.country}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Building2 size={18} className="text-accent" style={{ color: 'var(--accent)' }} />
                            <span>Hosted by <strong>{event.org.name}</strong></span>
                        </div>
                    </div>

                    <p style={{ fontSize: '18px', lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: '800px', marginBottom: '48px' }}>
                        {event.description || 'Join us for this amazing event.'}
                    </p>

                    {event.status === 'LIVE' ? (
                        <RegistrationModal 
                            event={event} 
                            tiers={event.ticketTypes.map((t: any) => ({ ...t, price: Number(t.price) }))} 
                        />
                    ) : (
                        <div style={{ display: 'inline-flex', padding: '16px 32px', background: 'var(--bg-highlight)', color: 'var(--text-secondary)', borderRadius: '30px', fontWeight: 600 }}>
                            Ticket Sales Opening Soon
                        </div>
                    )}
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px', display: 'grid', gridTemplateColumns: '1fr', gap: '60px' }}>
                {/* Speakers Section */}
                {event.speakers.length > 0 && (
                    <section>
                        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '32px' }}>Featured Speakers</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                            {event.speakers.map(speaker => (
                                <div key={speaker.id} className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '20px', flexShrink: 0 }}>
                                        {speaker.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>{speaker.name}</h3>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>{speaker.jobTitle}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}>{speaker.track}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Agenda Section */}
                {event.sessions.length > 0 && (
                    <section>
                        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '32px' }}>Agenda</h2>
                        <div className="card" style={{ overflow: 'hidden' }}>
                            {event.sessions.map((session, i) => (
                                <div key={session.id} style={{
                                    padding: '20px 24px',
                                    borderBottom: i === event.sessions.length - 1 ? 'none' : '1px solid var(--border)',
                                    display: 'flex',
                                    gap: '20px',
                                    flexWrap: 'wrap',
                                }}>
                                    <div style={{ color: 'var(--text-secondary)', fontWeight: 600, minWidth: '100px' }}>
                                        <div style={{ fontSize: '13px', marginBottom: '4px' }}>Day {session.day}</div>
                                        <div style={{ fontSize: '17px', color: 'var(--text-primary)' }}>{session.time}</div>
                                    </div>
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                                            <h4 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>{session.title}</h4>
                                            <span style={{ padding: '2px 10px', background: 'var(--bg-surface-2)', color: 'var(--text-secondary)', borderRadius: '12px', fontSize: '12px', whiteSpace: 'nowrap' }}>{session.track}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '14px', flexWrap: 'wrap' }}>
                                            {session.speaker && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={14} /> {session.speaker.name}</span>}
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {session.venue}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {session.durationMin} min</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}
