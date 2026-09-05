'use client'
import { useState, useEffect, use } from 'react'
import { Plus, Search, Clock, Pencil, Trash2, X } from 'lucide-react'

type Session = {
    id: string
    title: string
    track: string
    venue: string
    day: number
    time: string
    durationMin: number
    capacity: number
    registered: number
    status: string
    speakerId: string | null
    speaker?: { id: string; name: string } | null
}

export default function SessionsPage({ params }: { params: Promise<{ orgSlug: string; eventSlug: string }> }) {
    const { orgSlug, eventSlug } = use(params)
    const [sessions, setSessions] = useState<Session[]>([])
    const [speakers, setSpeakers] = useState<{ id: string; name: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        title: '', track: 'AI / ML', venue: 'Main Hall', day: 1, time: '09:00', durationMin: 60, capacity: 200, speakerId: ''
    })

    const tracks = ['AI / ML', 'Cloud & DevOps', 'Web3 & Blockchain', 'Cybersecurity', 'Mobile & Frontend', 'Data Engineering']
    const venues = ['Main Hall', 'Workshop Room A', 'Workshop Room B', 'Auditorium', 'Breakout Room']
    const statuses: Record<string, { color: string; bg: string }> = {
        UPCOMING: { color: 'var(--blue)', bg: 'var(--blue-dim)' },
        LIVE: { color: '#00ff80', bg: 'rgba(0,255,128,0.1)' },
        FULL: { color: 'var(--amber)', bg: 'rgba(255,180,0,0.1)' },
        ENDED: { color: 'var(--text-muted)', bg: 'var(--bg-highlight)' },
    }

    const fetchSessions = async () => {
        try {
            const res = await fetch(`/api/org/${orgSlug}/events/${eventSlug}/sessions`)
            if (res.ok) setSessions(await res.json())
        } catch { /* ignore */ } finally { setLoading(false) }
    }

    const fetchSpeakers = async () => {
        try {
            const res = await fetch(`/api/org/${orgSlug}/events/${eventSlug}/speakers`)
            if (res.ok) setSpeakers(await res.json())
        } catch { /* ignore */ }
    }

    useEffect(() => { fetchSessions(); fetchSpeakers() }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        const url = editingId
            ? `/api/org/${orgSlug}/events/${eventSlug}/sessions/${editingId}`
            : `/api/org/${orgSlug}/events/${eventSlug}/sessions`
        const method = editingId ? 'PATCH' : 'POST'
        const payload = { ...formData, day: Number(formData.day), durationMin: Number(formData.durationMin), capacity: Number(formData.capacity), speakerId: formData.speakerId || null }

        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            if (!res.ok) {
                const d = await res.json().catch(() => ({}))
                throw new Error(d.error || 'Failed to save session')
            }
            setShowForm(false); setEditingId(null)
            setFormData({ title: '', track: 'AI / ML', venue: 'Main Hall', day: 1, time: '09:00', durationMin: 60, capacity: 200, speakerId: '' })
            fetchSessions()
        } catch (err: any) { setError(err.message) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this session?')) return
        await fetch(`/api/org/${orgSlug}/events/${eventSlug}/sessions/${id}`, { method: 'DELETE' })
        fetchSessions()
    }

    const startEdit = (s: Session) => {
        setFormData({ title: s.title, track: s.track, venue: s.venue, day: s.day, time: s.time, durationMin: s.durationMin, capacity: s.capacity, speakerId: s.speakerId || '' })
        setEditingId(s.id); setShowForm(true)
    }

    const filtered = sessions.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.track.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="page-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Sessions</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{sessions.length} session{sessions.length !== 1 ? 's' : ''} scheduled</p>
                </div>
                <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ title: '', track: 'AI / ML', venue: 'Main Hall', day: 1, time: '09:00', durationMin: 60, capacity: 200, speakerId: '' }) }} className="btn btn-primary">
                    <Plus size={16} /> Add Session
                </button>
            </div>

            <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '400px' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Search sessions..." className="form-input" style={{ paddingLeft: '40px' }} value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading sessions...</div>
            ) : filtered.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Clock size={48} style={{ margin: '0 auto 16px', opacity: 0.3, color: 'var(--text-muted)' }} />
                    <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>No sessions yet</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Schedule your first session to build the agenda.</p>
                </div>
            ) : (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Session', 'Track', 'Day / Time', 'Venue', 'Speaker', 'Capacity', 'Status', ''].map(h => (
                                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(s => {
                                const st = statuses[s.status] || statuses.UPCOMING
                                return (
                                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 500, fontSize: '14px' }}>{s.title}</td>
                                        <td style={{ padding: '14px 16px' }}><span style={{ padding: '3px 10px', borderRadius: '12px', background: 'var(--bg-highlight)', color: 'var(--text-secondary)', fontSize: '12px' }}>{s.track}</span></td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>Day {s.day} • {s.time}</td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{s.venue}</td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{s.speaker?.name || '—'}</td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{s.registered}/{s.capacity}</td>
                                        <td style={{ padding: '14px 16px' }}><span style={{ padding: '3px 10px', borderRadius: '12px', background: st.bg, color: st.color, fontSize: '12px', fontWeight: 600 }}>{s.status}</span></td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button onClick={() => startEdit(s)} className="btn btn-ghost" style={{ padding: '4px' }}><Pencil size={14} /></button>
                                                <button onClick={() => handleDelete(s.id)} className="btn btn-ghost" style={{ padding: '4px', color: 'var(--red)' }}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Form */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="card" style={{ width: '520px', maxWidth: '90vw', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>{editingId ? 'Edit Session' : 'Add Session'}</h2>
                            <button onClick={() => { setShowForm(false); setError('') }} className="btn btn-ghost" style={{ padding: '4px' }}><X size={20} /></button>
                        </div>
                        {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group"><label className="form-label">Session Title *</label><input required className="form-input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group"><label className="form-label">Track</label><select className="form-input" value={formData.track} onChange={e => setFormData({ ...formData, track: e.target.value })}>{tracks.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                                <div className="form-group"><label className="form-label">Venue</label><select className="form-input" value={formData.venue} onChange={e => setFormData({ ...formData, venue: e.target.value })}>{venues.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                <div className="form-group"><label className="form-label">Day</label><input type="number" min={1} className="form-input" value={formData.day} onChange={e => setFormData({ ...formData, day: Number(e.target.value) })} /></div>
                                <div className="form-group"><label className="form-label">Time</label><input type="time" className="form-input" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Duration (min)</label><input type="number" min={15} className="form-input" value={formData.durationMin} onChange={e => setFormData({ ...formData, durationMin: Number(e.target.value) })} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group"><label className="form-label">Capacity</label><input type="number" min={1} className="form-input" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })} /></div>
                                <div className="form-group"><label className="form-label">Speaker</label><select className="form-input" value={formData.speakerId} onChange={e => setFormData({ ...formData, speakerId: e.target.value })}><option value="">— None —</option>{speakers.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}</select></div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                                <button type="button" onClick={() => { setShowForm(false); setError('') }} className="btn btn-ghost">Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Add Session'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
