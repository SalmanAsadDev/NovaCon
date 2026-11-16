'use client'
import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Users, Sparkles } from 'lucide-react'

export default function NewEventPage({ params }: { params: Promise<{ orgSlug: string }> }) {
    const { orgSlug } = use(params)
    const router = useRouter()

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        eventType: 'Tech Conference',
        venue: '',
        city: 'Islamabad',
        startDate: '',
        endDate: '',
        capacity: 500,
        isPublic: true,
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch(`/api/org/${orgSlug}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    capacity: Number(formData.capacity)
                })
            })

            const contentType = res.headers.get('content-type') || ''
            let data: any = {}
            if (contentType.includes('application/json')) {
                data = await res.json()
            }

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create event')
            }

            router.push(`/org/${orgSlug}/events/${data.slug}/overview`)
        } catch (err: any) {
            setError(err.message || 'An error occurred while creating the event')
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <Link 
                href={`/org/${orgSlug}/events`}
                style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    color: 'var(--text-muted)', 
                    fontSize: '13px', 
                    marginBottom: '24px',
                    textDecoration: 'none'
                }}
            >
                <ArrowLeft size={16} /> Back to Events
            </Link>

            <div className="card" style={{ padding: '36px' }}>
                <div style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: '20px', fontSize: '12px', fontWeight: 600, marginBottom: '12px' }}>
                        <Sparkles size={14} /> New Event
                    </div>
                    <h1 style={{ fontSize: '26px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                        Create an Event
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Configure your event details, venue, dates, and attendee capacity.
                    </p>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: '24px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-group">
                        <label className="form-label">Event Name *</label>
                        <input 
                            type="text"
                            required
                            placeholder="e.g. NovaCon Developer Summit 2026"
                            className="form-input"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea 
                            rows={3}
                            placeholder="A premier technology gathering exploring artificial intelligence, cloud, and edge computing."
                            className="form-input"
                            style={{ resize: 'vertical' }}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Event Type</label>
                            <input 
                                type="text"
                                placeholder="e.g. Conference, Workshop"
                                className="form-input"
                                value={formData.eventType}
                                onChange={e => setFormData({ ...formData, eventType: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Expected Capacity *</label>
                            <input 
                                type="number"
                                required
                                min={10}
                                max={50000}
                                className="form-input"
                                value={formData.capacity}
                                onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Venue Name</label>
                            <input 
                                type="text"
                                placeholder="e.g. Jinnah Convention Centre"
                                className="form-input"
                                value={formData.venue}
                                onChange={e => setFormData({ ...formData, venue: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">City</label>
                            <input 
                                type="text"
                                placeholder="e.g. Islamabad, Lahore, Karachi"
                                className="form-input"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Start Date *</label>
                            <input 
                                type="date"
                                required
                                className="form-input"
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">End Date *</label>
                            <input 
                                type="date"
                                required
                                className="form-input"
                                value={formData.endDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                        <Link href={`/org/${orgSlug}/events`} className="btn btn-ghost">
                            Cancel
                        </Link>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth: '140px', justifyContent: 'center' }}>
                            {loading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Launch Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
