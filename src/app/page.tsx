import Link from 'next/link'
import { Calendar, Users, BarChart3, Building2, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { EventStatus } from '@prisma/client'

// Server component to fetch public events
export default async function LandingPage() {
    const publicEvents = await prisma.event.findMany({
        where: {
            isPublic: true,
            status: {
                in: [EventStatus.PUBLISHED, EventStatus.LIVE]
            }
        },
        include: {
            org: true,
            _count: {
                select: { sessions: true, speakers: true }
            }
        },
        orderBy: {
            startDate: 'asc'
        }
    })

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Top Navigation */}
            <header style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '70px',
                background: 'rgba(13, 17, 23, 0.75)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--border)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, var(--accent), #FF8A00)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#0D1117', fontWeight: 700, fontSize: '16px'
                    }}>
                        N
                    </div>
                    <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '20px', letterSpacing: '-0.5px' }}>
                        NovaCon
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href="/login" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }} className="hover:text-primary">
                        Sign In
                    </Link>
                    <Link href="/signup" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '30px' }}>
                        Get Started
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section style={{
                padding: '160px 24px 100px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: 'radial-gradient(ellipse at 50% 0%, var(--accent-dim) 0%, transparent 70%)'
            }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '6px 12px', borderRadius: '20px',
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    fontSize: '12px', fontWeight: 600, color: 'var(--accent)',
                    marginBottom: '32px',
                    animation: 'fadeIn 0.5s ease both'
                }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
                    NovaCon Platform 2.0 is Live
                </div>
                
                <h1 style={{
                    fontSize: 'clamp(40px, 6vw, 72px)',
                    fontWeight: 800,
                    letterSpacing: '-1.5px',
                    lineHeight: 1.1,
                    marginBottom: '24px',
                    animation: 'fadeIn 0.7s ease both',
                    animationDelay: '0.1s'
                }}>
                    The Operating System for <br />
                    <span style={{
                        background: 'linear-gradient(90deg, #fff, var(--text-secondary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Live Experiences.
                    </span>
                </h1>
                
                <p style={{
                    fontSize: 'clamp(16px, 2vw, 20px)',
                    color: 'var(--text-secondary)',
                    maxWidth: '700px',
                    margin: '0 auto 48px',
                    lineHeight: 1.6,
                    animation: 'fadeIn 0.9s ease both',
                    animationDelay: '0.2s'
                }}>
                    Unify your event planning, attendee management, and financial analytics in one intelligent platform. Built for organizations that demand excellence.
                </p>
                
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeIn 1s ease both', animationDelay: '0.3s' }}>
                    <Link href="/signup" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '16px', borderRadius: '30px' }}>
                        Start Organizing Events <ArrowRight size={18} />
                    </Link>
                    <a href="#events" className="btn btn-ghost" style={{ padding: '16px 32px', fontSize: '16px', borderRadius: '30px' }}>
                        Explore Public Events
                    </a>
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: '80px 24px', background: 'var(--bg-surface-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Everything your team needs</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Built for event managers, planners, finance teams, and operational staff.</p>
                    </div>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '24px'
                    }}>
                        <div className="card card-hover" style={{ padding: '32px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--blue-dim)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                                <Users size={24} />
                            </div>
                            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Attendee Intelligence</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                                Seamless registration, real-time check-ins, and audience insights. Keep track of exactly who is walking through your doors.
                            </p>
                        </div>
                        <div className="card card-hover" style={{ padding: '32px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--green-dim)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                                <Calendar size={24} />
                            </div>
                            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Session & Speaker Ops</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                                Schedule tracks, manage speaker profiles, and handle venue capacities dynamically with zero overlap conflicts.
                            </p>
                        </div>
                        <div className="card card-hover" style={{ padding: '32px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                                <BarChart3 size={24} />
                            </div>
                            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Financial Control</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                                Budget vs. actuals, vendor payments, and ticket revenue reconciliation. Keep your event's P&L in the green.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Events Grid */}
            <section id="events" style={{ padding: '100px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Upcoming Events</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Discover and register for experiences hosted on NovaCon.</p>
                    </div>
                </div>

                {publicEvents.length === 0 ? (
                    <div className="empty-state card" style={{ padding: '80px 24px' }}>
                        <Calendar size={48} style={{ color: 'var(--border-strong)', marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '20px', color: 'var(--text-primary)' }}>No public events</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Check back later or host your own event.</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                        gap: '32px'
                    }}>
                        {publicEvents.map(event => (
                            <div key={event.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ height: '180px', background: 'var(--bg-surface-2)', position: 'relative' }}>
                                    <div style={{ position: 'absolute', bottom: '16px', left: '16px', zIndex: 10 }}>
                                        <div className="badge badge-upcoming" style={{ marginBottom: '8px', fontSize: '10px' }}>
                                            {event.eventType?.toUpperCase() || 'EVENT'}
                                        </div>
                                        <h3 style={{ fontSize: '24px', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{event.name}</h3>
                                    </div>
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-base), transparent)' }} />
                                </div>
                                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
                                        <Building2 size={16} />
                                        <span>Hosted by <strong style={{ color: 'var(--text-primary)' }}>{event.org.name}</strong></span>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                                        <div>
                                            <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>{event._count.sessions}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sessions</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>{event._count.speakers}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Speakers</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ marginTop: 'auto' }}>
                                        <Link href={`/events/${event.slug}`} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                                            View Details & Register
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
            
            <style dangerouslySetInnerHTML={{__html: `
                .hover\\:text-primary:hover { color: var(--text-primary) !important; }
            `}} />
        </div>
    )
}