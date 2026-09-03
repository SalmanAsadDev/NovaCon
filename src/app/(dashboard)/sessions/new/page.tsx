'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewSessionPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [speakers, setSpeakers] = useState<{id: string, name: string}[]>([])
    
    const [formData, setFormData] = useState({
        title: '',
        track: 'AI & ML',
        venue: 'Main Auditorium',
        day: 1,
        time: '09:00',
        durationMin: 60,
        capacity: 100,
        speakerId: '',
    })

    useEffect(() => {
        // Fetch speakers for the dropdown
        fetch('/api/speakers').then(res => res.json()).then(data => {
            if (Array.isArray(data)) setSpeakers(data)
        }).catch(console.error)
    }, [])

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
            const res = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            
            if (!res.ok) {
                const data = await res.json()
                setError(data.error ? JSON.stringify(data.error) : 'Failed to create session')
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

    return (
        <div className="page-fade">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Add Session</h1>
                    <p className="page-subtitle">Schedule a new session for the event</p>
                </div>
                <Link href="/sessions" className="btn btn-ghost">Cancel</Link>
            </div>

            <div className="card" style={{ maxWidth: '600px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {error && <div className="alert alert-error">{error}</div>}
                    
                    <div className="form-group">
                        <label className="form-label">Session Title</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>
                    
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Track</label>
                            <select
                                className="form-select"
                                value={formData.track}
                                onChange={(e) => setFormData({...formData, track: e.target.value})}
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
                                onChange={(e) => setFormData({...formData, venue: e.target.value})}
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
                    
                    <div className="form-grid-3">
                        <div className="form-group">
                            <label className="form-label">Day</label>
                            <select
                                className="form-select"
                                value={formData.day}
                                onChange={(e) => setFormData({...formData, day: Number(e.target.value)})}
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
                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Duration (min)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.durationMin}
                                onChange={(e) => setFormData({...formData, durationMin: Number(e.target.value)})}
                                min={15}
                                step={15}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Speaker (Optional)</label>
                            <select
                                className="form-select"
                                value={formData.speakerId}
                                onChange={(e) => setFormData({...formData, speakerId: e.target.value})}
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
                                onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})}
                                min={10}
                                required
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center' }}>
                        {loading ? 'Saving...' : 'Save Session'}
                    </button>
                </form>
            </div>
        </div>
    )
}
