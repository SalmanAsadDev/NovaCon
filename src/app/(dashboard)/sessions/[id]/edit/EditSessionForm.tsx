'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Speaker {
    id: string
    name: string
}

interface Session {
    id: string
    title: string
    track: string
    venue: string
    day: number
    time: string
    durationMin: number
    capacity: number
    speakerId: string | null
    status: string
}

export default function EditSessionForm({ session, speakers }: { session: Session, speakers: Speaker[] }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        title: session.title,
        track: session.track,
        venue: session.venue,
        day: session.day,
        time: session.time,
        durationMin: session.durationMin,
        capacity: session.capacity,
        speakerId: session.speakerId || '',
        status: session.status,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const payload = {
            ...formData,
            day: Number(formData.day),
            durationMin: Number(formData.durationMin),
            capacity: Number(formData.capacity),
            speakerId: formData.speakerId || null
        }

        try {
            const res = await fetch(`/api/sessions/${session.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const data = await res.json()
                setError(data.error ? JSON.stringify(data.error) : 'Failed to update session')
            } else {
                router.push('/sessions')
                router.refresh()
            }
        } catch (err) {
            setError('Network error')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) return
        setLoading(true)
        setError('')

        try {
            const res = await fetch(`/api/sessions/${session.id}`, {
                method: 'DELETE',
            })

            if (!res.ok) {
                setError('Failed to delete session')
                setLoading(false)
            } else {
                router.push('/sessions')
                router.refresh()
            }
        } catch (err) {
            setError('Network error')
            setLoading(false)
        }
    }

    const handleCycleStatus = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch(`/api/sessions/${session.id}/status`, {
                method: 'PATCH',
            })
            if (!res.ok) {
                setError('Failed to toggle status')
            } else {
                const updated = await res.json()
                setFormData(prev => ({ ...prev, status: updated.status }))
            }
        } catch (err) {
            setError('Network error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Edit Session</h1>
                    <p className="page-subtitle">Update schedule and status for: {session.title}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        type="button" 
                        onClick={handleCycleStatus} 
                        className="btn btn-ghost"
                        disabled={loading}
                    >
                        Toggle Status ({formData.status})
                    </button>
                    <Link href="/sessions" className="btn btn-ghost">Cancel</Link>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div className="card">
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {error && <div className="alert alert-error">{error}</div>}

                        <div className="form-group">
                            <label className="form-label">Session Title</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Track</label>
                                <select
                                    className="form-select"
                                    value={formData.track}
                                    onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                                >
                                    <option value="AI & ML">AI & ML</option>
                                    <option value="Web Dev">Web Development</option>
                                    <option value="Cybersecurity">Cybersecurity</option>
                                    <option value="Blockchain">Blockchain</option>
                                    <option value="DevOps">DevOps & Cloud</option>
                                    <option value="CP">Competitive Programming</option>
                                    <option value="Emerging Tech">Emerging Tech</option>
                                    <option value="Entrepreneurship">Entrepreneurship</option>
                                    <option value="General">General (Keynotes/Ceremonies)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Venue</label>
                                <select
                                    className="form-select"
                                    value={formData.venue}
                                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                >
                                    <option value="Main Auditorium">Main Auditorium</option>
                                    <option value="Room 1">Room 1</option>
                                    <option value="Room 2">Room 2</option>
                                    <option value="Room 3">Room 3</option>
                                    <option value="Room 4">Room 4</option>
                                    <option value="Lab A">Lab A</option>
                                    <option value="Lab B">Lab B</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Day</label>
                                <select
                                    className="form-select"
                                    value={formData.day}
                                    onChange={(e) => setFormData({ ...formData, day: Number(e.target.value) })}
                                >
                                    <option value={1}>Day 1</option>
                                    <option value={2}>Day 2</option>
                                    <option value={3}>Day 3</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Time</label>
                                <input
                                    type="time"
                                    className="form-input"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Duration (min)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.durationMin}
                                    onChange={(e) => setFormData({ ...formData, durationMin: Number(e.target.value) })}
                                    min={15}
                                    step={15}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Speaker (Optional)</label>
                                <select
                                    className="form-select"
                                    value={formData.speakerId}
                                    onChange={(e) => setFormData({ ...formData, speakerId: e.target.value })}
                                >
                                    <option value="">-- No Speaker / Panel --</option>
                                    {speakers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Capacity</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                                    min={10}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '15px', color: 'var(--red)' }}>Danger Zone</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Deleting this session will remove it permanently. Registered attendees count will be lost.
                    </p>
                    <button 
                        type="button" 
                        onClick={handleDelete} 
                        className="btn btn-danger" 
                        disabled={loading}
                        style={{ justifyContent: 'center', width: '100%' }}
                    >
                        Delete Session
                    </button>
                </div>
            </div>
        </div>
    )
}
