import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function SessionsPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await auth()
    const isAdmin = session?.user?.role === 'ADMIN'
    
    // Await searchParams in Next.js 15+
    const resolvedParams = await searchParams
    const dayFilter = resolvedParams.day ? parseInt(resolvedParams.day as string) : undefined
    const trackFilter = resolvedParams.track as string | undefined

    const sessions = await prisma.session.findMany({
        where: {
            ...(dayFilter ? { day: dayFilter } : {}),
            ...(trackFilter ? { track: trackFilter } : {}),
        },
        include: { speaker: true },
        orderBy: [{ day: 'asc' }, { time: 'asc' }],
    })

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'UPCOMING': return 'badge-upcoming'
            case 'LIVE': return 'badge-live'
            case 'FULL': return 'badge-full'
            case 'ENDED': return 'badge-ended'
            default: return 'badge-upcoming'
        }
    }

    return (
        <div className="page-fade">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Sessions</h1>
                    <p className="page-subtitle">Manage conference agenda and schedule</p>
                </div>
                {isAdmin && (
                    <Link href="/sessions/new" className="btn btn-primary">
                        + Add Session
                    </Link>
                )}
            </div>

            <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Link href="/sessions" className={`btn ${!dayFilter ? 'btn-primary' : 'btn-ghost'} btn-sm`}>All Days</Link>
                    <Link href="/sessions?day=1" className={`btn ${dayFilter === 1 ? 'btn-primary' : 'btn-ghost'} btn-sm`}>Day 1</Link>
                    <Link href="/sessions?day=2" className={`btn ${dayFilter === 2 ? 'btn-primary' : 'btn-ghost'} btn-sm`}>Day 2</Link>
                    <Link href="/sessions?day=3" className={`btn ${dayFilter === 3 ? 'btn-primary' : 'btn-ghost'} btn-sm`}>Day 3</Link>
                    
                    <div style={{ width: '1px', background: 'var(--border)', margin: '0 8px' }}></div>
                    
                    <Link href="/sessions" className={`btn ${!trackFilter && !dayFilter ? 'btn-primary' : 'btn-ghost'} btn-sm`}>All Tracks</Link>
                    <Link href="/sessions?track=AI & ML" className={`btn ${trackFilter === 'AI & ML' ? 'btn-primary' : 'btn-ghost'} btn-sm`}>AI & ML</Link>
                    <Link href="/sessions?track=Web Dev" className={`btn ${trackFilter === 'Web Dev' ? 'btn-primary' : 'btn-ghost'} btn-sm`}>Web Dev</Link>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Session Title</th>
                            <th>Speaker</th>
                            <th>Track / Venue</th>
                            <th>Status</th>
                            <th>Capacity</th>
                            {isAdmin && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.length === 0 ? (
                            <tr>
                                <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '40px' }}>
                                    <div className="empty-state">
                                        <div className="empty-state-icon">◫</div>
                                        <div>No sessions found for this filter.</div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            sessions.map(s => {
                                const fillRate = Math.round((s.registered / s.capacity) * 100)
                                return (
                                    <tr key={s.id}>
                                        <td style={{ whiteSpace: 'nowrap' }}>
                                            <div style={{ fontWeight: 600 }}>Day {s.day}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{s.time} ({s.durationMin}m)</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500, marginBottom: '4px' }}>{s.title}</div>
                                        </td>
                                        <td>
                                            {s.speaker ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        width: '24px', height: '24px', borderRadius: '50%',
                                                        background: 'var(--border)', display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', fontSize: '9px', fontWeight: 600
                                                    }}>
                                                        {s.speaker.avatar}
                                                    </div>
                                                    <span style={{ fontSize: '13px' }}>{s.speaker.name}</span>
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>TBA</span>
                                            )}
                                        </td>
                                        <td>
                                            <div>{s.track}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{s.venue}</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadgeClass(s.status)}`}>
                                                {s.status === 'LIVE' && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', marginRight: '4px', animation: 'pulse 1.5s infinite' }}></span>}
                                                {s.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                                                <div style={{ width: '60px' }}>
                                                    <div className="progress-bar">
                                                        <div className="progress-fill" style={{ width: `${fillRate}%`, background: fillRate >= 100 ? 'var(--red)' : 'var(--accent)' }}></div>
                                                    </div>
                                                </div>
                                                <span style={{ color: fillRate >= 100 ? 'var(--red)' : 'inherit' }}>{s.registered}/{s.capacity}</span>
                                            </div>
                                        </td>
                                        {isAdmin && (
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <Link href={`/sessions/${s.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                                                    {/* In a real app we'd have a Client component for status toggle */}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
