'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { CalendarDays, Radio, Users, DollarSign, ArrowUpRight } from 'lucide-react'
import { SkeletonKpiGrid } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

type Dashboard = {
    orgName: string
    userName: string
    totalEvents: number
    draftEvents: number
    liveEvents: number
    completedEvents: number
    totalRegistrations: number
    recentRevenue: number
    upcomingEvents: { id: string; name: string; slug: string; startDate: string; status: string; registrationCount: number }[]
}

const statusColors: Record<string, { color: string; bg: string }> = {
    LIVE: { color: 'var(--green)', bg: 'var(--green-dim)' },
    PUBLISHED: { color: 'var(--blue)', bg: 'var(--blue-dim)' },
    DRAFT: { color: 'var(--text-muted)', bg: 'var(--bg-highlight)' },
    COMPLETED: { color: 'var(--purple)', bg: 'var(--purple-dim)' },
}

export default function OrgDashboardPage({ params }: { params: Promise<{ orgSlug: string }> }) {
    const { orgSlug } = use(params)
    const [data, setData] = useState<Dashboard | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`/api/org/${orgSlug}/dashboard`)
            .then(res => res.ok ? res.json() : null)
            .then(setData)
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [orgSlug])

    const kpis = data ? [
        { title: 'Total Events', value: data.totalEvents, icon: CalendarDays, color: 'var(--accent)' },
        { title: 'Live Now', value: data.liveEvents, icon: Radio, color: 'var(--green)' },
        { title: 'Total Registrations', value: data.totalRegistrations.toLocaleString(), icon: Users, color: 'var(--blue)' },
        { title: 'Revenue', value: `$${data.recentRevenue.toLocaleString()}`, icon: DollarSign, color: 'var(--purple)' },
    ] : []

    return (
        <div className="page-fade">
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Welcome back{data ? `, ${data.userName}` : ''}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    {data?.orgName ?? ' '}
                </p>
            </div>

            {loading ? (
                <SkeletonKpiGrid count={4} />
            ) : !data ? (
                <EmptyState title="Could not load dashboard" description="Please refresh the page or try again." />
            ) : (
                <>
                    <div className="kpi-grid" style={{ marginBottom: '32px' }}>
                        {kpis.map((k, i) => {
                            const Icon = k.icon
                            return (
                                <div key={i} className="kpi-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>{k.title}</span>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${k.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon size={16} color={k.color} />
                                        </div>
                                    </div>
                                    <div className="kpi-value" style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>{k.value}</div>
                                </div>
                            )
                        })}
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Upcoming Events</h3>
                    {data.upcomingEvents.length === 0 ? (
                        <EmptyState
                            icon={<CalendarDays size={40} />}
                            title="No upcoming events"
                            description="Events you schedule will appear here."
                            action={{ label: 'Create event', href: `/org/${orgSlug}/events/new` }}
                        />
                    ) : (
                        <div className="card" style={{ overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        {['Event', 'Date', 'Status', 'Registrations', ''].map(h => (
                                            <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.upcomingEvents.map(e => {
                                        const st = statusColors[e.status] || statusColors.DRAFT
                                        return (
                                            <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 500, fontSize: '14px' }}>{e.name}</td>
                                                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                                    {new Date(e.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{ padding: '3px 10px', borderRadius: '12px', background: st.bg, color: st.color, fontSize: '12px', fontWeight: 600 }}>{e.status}</span>
                                                </td>
                                                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{e.registrationCount}</td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <Link href={`/org/${orgSlug}/events/${e.slug}/overview`} className="btn btn-ghost" style={{ padding: '4px 8px' }}>
                                                        <ArrowUpRight size={16} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
