import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const session = await auth()
    
    // Fetch stats server-side
    const { prisma } = await import('@/lib/prisma')
    
    const [
        totalRegistrations,
        checkedIn,
        sessionsLive,
        totalSessions,
        totalSpeakers,
        checkedInRegistrations,
    ] = await Promise.all([
        prisma.registration.count(),
        prisma.registration.count({ where: { status: 'CHECKED_IN' } }),
        prisma.session.count({ where: { status: 'LIVE' } }),
        prisma.session.count(),
        prisma.speaker.count(),
        prisma.registration.findMany({ 
            where: { status: 'CHECKED_IN' },
            select: { ticketType: true } 
        }),
    ])

    const TICKET_PRICES: Record<string, number> = {
        STANDARD: 2500,
        PREMIUM: 5000,
        WORKSHOP: 3500,
    }

    const revenue = checkedInRegistrations.reduce((sum, r) => sum + (TICKET_PRICES[r.ticketType] || 0), 0)

    const capacity = 1500
    const checkinRate = totalRegistrations > 0 ? Math.round((checkedIn / totalRegistrations) * 100) : 0
    const fillRate = Math.round((totalRegistrations / capacity) * 100)

    return (
        <div className="page-fade">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Welcome back, {session?.user?.name?.split(' ')[0]}</h1>
                    <p className="page-subtitle">Here's what's happening at NovaCon right now.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="badge badge-live" style={{ padding: '6px 12px', fontSize: '13px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }}></span>
                        Day 2 Active
                    </div>
                </div>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-label">Total Registrations</div>
                    <div className="kpi-value">{totalRegistrations}</div>
                    <div className="kpi-sub" style={{ color: 'var(--accent)' }}>{fillRate}% of capacity</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Checked In</div>
                    <div className="kpi-value">{checkedIn}</div>
                    <div className="kpi-sub" style={{ color: 'var(--green)' }}>{checkinRate}% arrival rate</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Total Revenue</div>
                    <div className="kpi-value">Rs. {(revenue / 1000000).toFixed(2)}M</div>
                    <div className="kpi-sub">Across all ticket tiers</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Live Sessions</div>
                    <div className="kpi-value">{sessionsLive}</div>
                    <div className="kpi-sub">Out of {totalSessions} total</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Speakers</div>
                    <div className="kpi-value">{totalSpeakers}</div>
                    <div className="kpi-sub">Across 8 tracks</div>
                </div>
            </div>

            <div className="dashboard-main-grid">
                <div className="card">
                    <h3 style={{ fontSize: '16px', marginBottom: '16px', fontFamily: 'Sora, sans-serif' }}>Event Progress</h3>
                    
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Overall Capacity ({totalRegistrations}/{capacity})</span>
                            <span style={{ fontWeight: 600 }}>{fillRate}%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${fillRate}%` }}></div>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Check-in Completion ({checkedIn}/{totalRegistrations})</span>
                            <span style={{ fontWeight: 600, color: 'var(--green)' }}>{checkinRate}%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${checkinRate}%`, background: 'var(--green)' }}></div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ fontSize: '16px', marginBottom: '16px', fontFamily: 'Sora, sans-serif' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {session?.user?.role === 'ADMIN' && (
                            <>
                                <a href="/registrations" className="btn btn-ghost" style={{ justifyContent: 'space-between', padding: '12px' }}>
                                    Manage Check-ins <span style={{ color: 'var(--text-muted)' }}>&rarr;</span>
                                </a>
                                <a href="/sessions/new" className="btn btn-ghost" style={{ justifyContent: 'space-between', padding: '12px' }}>
                                    Add New Session <span style={{ color: 'var(--text-muted)' }}>&rarr;</span>
                                </a>
                                <a href="/api/registrations/export" className="btn btn-primary" style={{ justifyContent: 'space-between', padding: '12px' }}>
                                    Export CSV Report <span style={{ color: '#000' }}>&darr;</span>
                                </a>
                            </>
                        )}
                        {session?.user?.role !== 'ADMIN' && (
                            <div className="alert alert-info">
                                Your account has Viewer access. You can view sessions, speakers, and analytics, but cannot modify data or view attendee PII.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
