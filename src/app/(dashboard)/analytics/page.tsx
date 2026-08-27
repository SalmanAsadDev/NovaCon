import { prisma } from '@/lib/prisma'
import Charts from './Charts'

function formatDate(d: Date) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default async function AnalyticsPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await searchParams

    const [byTrackRaw, byUniversityRaw, byTicketRaw, allRegistrations, seedDayStats] = await Promise.all([
        prisma.registration.groupBy({ by: ['track'], _count: { id: true } }),
        prisma.registration.groupBy({ by: ['university'], _count: { id: true } }),
        prisma.registration.groupBy({ by: ['ticketType'], _count: { id: true } }),
        prisma.registration.findMany({
            select: { registeredAt: true },
            orderBy: { registeredAt: 'asc' },
        }),
        prisma.registrationDayStat.findMany({ orderBy: { date: 'asc' } }),
    ])

    // Build date→count map from real registeredAt timestamps
    const realCounts: Record<string, number> = {}
    for (const reg of allRegistrations) {
        const label = formatDate(new Date(reg.registeredAt))
        realCounts[label] = (realCounts[label] || 0) + 1
    }

    // Build combined map: seed data first, then overlay real data
    // Use a unified map keyed by the string label
    const combined: Record<string, number> = {}
    for (const stat of seedDayStats) {
        combined[stat.date] = stat.count
    }
    for (const [date, count] of Object.entries(realCounts)) {
        // If the same label exists in seed data, add on top; otherwise add new entry
        combined[date] = (combined[date] || 0) + count
    }

    // Sort all dates chronologically by parsing "Mon DD" format
    const parseDate = (label: string) => new Date(`${label} 2025`)
    const allDayStats = Object.entries(combined)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime())

    const allDates = allDayStats.map(d => d.date)

    // Default: show full range
    const startDate = (resolvedParams.startDate as string) || allDates[0] || ''
    const endDate = (resolvedParams.endDate as string) || allDates[allDates.length - 1] || ''

    const startIdx = Math.max(0, allDates.indexOf(startDate))
    const endIdx = allDates.indexOf(endDate) === -1 ? allDates.length - 1 : allDates.indexOf(endDate)
    const [sliceStart, sliceEnd] = startIdx <= endIdx ? [startIdx, endIdx] : [endIdx, startIdx]
    const filteredDayStats = allDayStats.slice(sliceStart, sliceEnd + 1)

    const data = {
        byTrack: byTrackRaw.map(r => ({ name: r.track, count: r._count.id })).sort((a, b) => b.count - a.count),
        byUniversity: byUniversityRaw.map(r => ({ name: r.university, count: r._count.id })).sort((a, b) => b.count - a.count),
        byTicket: byTicketRaw.map(r => ({ name: r.ticketType, count: r._count.id })),
        registrationsByDay: filteredDayStats,
    }

    return (
        <div className="page-fade">
            <div className="page-header" style={{ marginBottom: '16px' }}>
                <div>
                    <h1 className="page-title">Analytics</h1>
                    <p className="page-subtitle">Event data and registration trends</p>
                </div>
            </div>

            {/* Date range filter */}
            <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
                <form action="/analytics" method="GET" style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ width: '180px' }}>
                        <label className="form-label">Start Date</label>
                        <select name="startDate" defaultValue={startDate} className="form-select" style={{ padding: '6px 12px', fontSize: '13px' }}>
                            {allDates.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ width: '180px' }}>
                        <label className="form-label">End Date</label>
                        <select name="endDate" defaultValue={endDate} className="form-select" style={{ padding: '6px 12px', fontSize: '13px' }}>
                            {allDates.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm" style={{ height: '34px', padding: '0 16px' }}>
                        Apply Filter
                    </button>
                    {(resolvedParams.startDate || resolvedParams.endDate) && (
                        <a href="/analytics" className="btn btn-ghost btn-sm" style={{ height: '34px', display: 'inline-flex', alignItems: 'center' }}>
                            Reset
                        </a>
                    )}
                </form>
            </div>

            <Charts data={data} />

            <div className="chart-card" style={{ marginTop: '24px' }}>
                <h3 className="chart-title">Top Universities</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {data.byUniversity.slice(0, 15).map((u, i) => (
                        <div key={u.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>#{i + 1}</span>
                            <span style={{ fontWeight: 500 }}>{u.name}</span>
                            <span className="badge" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>{u.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}


