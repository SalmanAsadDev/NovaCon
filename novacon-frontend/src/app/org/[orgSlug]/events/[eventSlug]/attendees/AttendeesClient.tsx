'use client'
import { useState, useMemo } from 'react'
import { Search, Download, Users } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

export type Attendee = {
    id: string
    name: string
    email: string
    status: 'REGISTERED' | 'CHECKED_IN' | 'CANCELLED'
    registeredAt: string
    ticketTierName: string | null
}

const statusStyles: Record<string, { color: string; bg: string }> = {
    REGISTERED: { color: 'var(--blue)', bg: 'var(--blue-dim)' },
    CHECKED_IN: { color: 'var(--green)', bg: 'var(--green-dim)' },
    CANCELLED: { color: 'var(--red)', bg: 'rgba(255,80,80,0.1)' },
}

export default function AttendeesClient({ attendees, capacity }: { attendees: Attendee[]; capacity: number }) {
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('ALL')
    const [tier, setTier] = useState('ALL')

    const tiers = useMemo(
        () => Array.from(new Set(attendees.map(a => a.ticketTierName).filter(Boolean))) as string[],
        [attendees]
    )

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return attendees.filter(a =>
            (q === '' || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)) &&
            (status === 'ALL' || a.status === status) &&
            (tier === 'ALL' || a.ticketTierName === tier)
        )
    }, [attendees, search, status, tier])

    const activeCount = attendees.filter(a => a.status !== 'CANCELLED').length
    const pct = capacity > 0 ? Math.min(100, Math.round((activeCount / capacity) * 100)) : 0

    const exportCsv = () => {
        const esc = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`
        const rows = [
            ['Name', 'Email', 'Ticket', 'Status', 'Date'],
            ...filtered.map(a => [
                a.name, a.email, a.ticketTierName ?? '', a.status,
                new Date(a.registeredAt).toLocaleDateString(),
            ]),
        ]
        const csv = rows.map(r => r.map(esc).join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `attendees-${new Date().toISOString().slice(0, 10)}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="page-fade">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Attendees</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{attendees.length} registered</p>
                </div>
                <button onClick={exportCsv} disabled={filtered.length === 0} className="btn btn-primary">
                    <Download size={16} /> Export CSV
                </button>
            </div>

            {/* Capacity progress */}
            <div className="card" style={{ padding: '20px 24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Capacity filled</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{activeCount} / {capacity} ({pct}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-highlight)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? 'var(--red)' : 'var(--accent)', transition: 'width 0.3s' }} />
                </div>
            </div>

            {/* Filter bar */}
            <div className="filter-bar-container" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" placeholder="Search name or email..." className="form-input" style={{ paddingLeft: '40px' }} value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="form-input" style={{ maxWidth: '180px' }} value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="ALL">All statuses</option>
                    <option value="REGISTERED">Registered</option>
                    <option value="CHECKED_IN">Checked in</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
                <select className="form-input" style={{ maxWidth: '180px' }} value={tier} onChange={e => setTier(e.target.value)}>
                    <option value="ALL">All tiers</option>
                    {tiers.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={<Users size={40} />}
                    title={attendees.length === 0 ? 'No attendees yet' : 'No matches'}
                    description={attendees.length === 0 ? 'Once people register, they appear here.' : 'Try adjusting your search or filters.'}
                />
            ) : (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Name', 'Email', 'Ticket', 'Date', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(a => {
                                const st = statusStyles[a.status] || statusStyles.REGISTERED
                                return (
                                    <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 500, fontSize: '14px' }}>{a.name}</td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{a.email}</td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{a.ticketTierName || '—'}</td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{new Date(a.registeredAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{ padding: '3px 10px', borderRadius: '12px', background: st.bg, color: st.color, fontSize: '12px', fontWeight: 600 }}>{a.status}</span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
