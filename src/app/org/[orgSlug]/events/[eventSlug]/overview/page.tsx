import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Users, Mic2, Clock, MapPin, ArrowUpRight, CheckCircle2 } from 'lucide-react'

export default async function EventOverviewPage({
    params
}: {
    params: Promise<{ orgSlug: string; eventSlug: string }>
}) {
    const session = await auth()
    if (!session?.user) redirect('/login')

    const { orgSlug, eventSlug } = await params

    const event = await prisma.event.findUnique({
        where: { slug: eventSlug },
        include: {
            org: true,
            ticketTypes: true,
            _count: {
                select: {
                    registrations: true,
                    speakers: true,
                    sessions: true,
                }
            }
        }
    })

    if (!event || event.org.slug !== orgSlug) {
        notFound()
    }

    // Dynamic Day Counter logic
    const today = new Date()
    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)

    today.setHours(0, 0, 0, 0)
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    let statusBadge = { text: 'Draft', color: 'var(--text-muted)', bg: 'var(--bg-highlight)' }
    let countdownText = ''

    if (today < startDate) {
        const diffDays = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        statusBadge = { text: 'Upcoming', color: 'var(--blue)', bg: 'var(--blue-dim)' }
        countdownText = `Starts in ${diffDays} day${diffDays === 1 ? '' : 's'}`
    } else if (today >= startDate && today <= endDate) {
        const currentDay = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        statusBadge = { text: 'LIVE NOW', color: '#00ff80', bg: 'rgba(0, 255, 128, 0.1)' }
        countdownText = `Day ${currentDay} of ${totalDays}`
    } else {
        statusBadge = { text: 'Completed', color: 'var(--purple)', bg: 'var(--purple-dim)' }
        countdownText = 'Event Concluded'
    }

    // Quick stats
    const stats = [
        {
            title: 'Registered Attendees',
            value: event._count.registrations,
            sub: `Capacity: ${event.capacity}`,
            icon: Users,
            color: 'var(--accent)',
            link: `/org/${orgSlug}/events/${eventSlug}/attendees`
        },
        {
            title: 'Keynote Speakers',
            value: event._count.speakers,
            sub: 'Active profiles',
            icon: Mic2,
            color: 'var(--blue)',
            link: `/org/${orgSlug}/events/${eventSlug}/speakers`
        },
        {
            title: 'Scheduled Sessions',
            value: event._count.sessions,
            sub: 'Across all tracks',
            icon: Clock,
            color: 'var(--purple)',
            link: `/org/${orgSlug}/events/${eventSlug}/sessions`
        },
    ]

    return (
        <div className="page-fade">
            {/* Header / Hero */}
            <div className="card" style={{ padding: '32px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px',
                    background: 'radial-gradient(circle, var(--accent-dim) 0%, transparent 70%)',
                    pointerEvents: 'none', opacity: 0.5
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 700,
                                letterSpacing: '0.5px',
                                color: statusBadge.color,
                                background: statusBadge.bg
                            }}>
                                {statusBadge.text}
                            </span>
                            <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600 }}>
                                {countdownText}
                            </span>
                        </div>

                        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                            {event.name}
                        </h1>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)', fontSize: '14px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={16} color="var(--accent)" />
                                {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            {(event.venue || event.city) && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <MapPin size={16} color="var(--accent)" />
                                    {event.venue}{event.venue && event.city ? ', ' : ''}{event.city}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Link href={`/events/${event.slug}`} target="_blank" className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            Public Page <ArrowUpRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {stats.map((s, idx) => {
                    const Icon = s.icon
                    return (
                        <div key={idx} className="card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
                                    {s.title}
                                </span>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={18} color={s.color} />
                                </div>
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                                {s.value}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {s.sub}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Quick Actions & Ticket Tiers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                        Ticket Tiers
                    </h3>
                    {event.ticketTypes.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No ticket tiers configured yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {event.ticketTypes.map((tier) => (
                                <div key={tier.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '12px 16px', borderRadius: '8px', background: 'var(--bg-surface-elevated)',
                                    border: '1px solid var(--border)'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{tier.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Capacity: {tier.capacity || 'Unlimited'}</div>
                                    </div>
                                    <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '15px' }}>
                                        {Number(tier.price) === 0 ? 'Free' : `PKR ${Number(tier.price).toLocaleString()}`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                        Workspace Quick Links
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <Link href={`/org/${orgSlug}/events/${eventSlug}/attendees`} className="btn btn-ghost" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
                            <span>Manage Registrations & Badges</span>
                            <ArrowUpRight size={16} />
                        </Link>
                        <Link href={`/org/${orgSlug}/events/${eventSlug}/speakers`} className="btn btn-ghost" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
                            <span>Manage Speakers & Keynotes</span>
                            <ArrowUpRight size={16} />
                        </Link>
                        <Link href={`/org/${orgSlug}/events/${eventSlug}/sessions`} className="btn btn-ghost" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
                            <span>Schedule & Agenda Timelines</span>
                            <ArrowUpRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
