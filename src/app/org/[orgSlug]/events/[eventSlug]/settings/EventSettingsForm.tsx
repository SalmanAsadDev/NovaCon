'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, AlertCircle } from 'lucide-react'

export default function EventSettingsForm({ event, orgSlug }: { event: any, orgSlug: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    
    // Format dates for input type="datetime-local" (YYYY-MM-DDThh:mm)
    const formatDateForInput = (dateString: string) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    }

    const [formData, setFormData] = useState({
        name: event.name || '',
        slug: event.slug || '',
        description: event.description || '',
        eventType: event.eventType || 'IN_PERSON',
        status: event.status || 'DRAFT',
        startDate: formatDateForInput(event.startDate),
        endDate: formatDateForInput(event.endDate),
        venue: event.venue || '',
        city: event.city || '',
        country: event.country || '',
        expectedAttendees: event.expectedAttendees || 0,
        isPublic: event.isPublic || false
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const res = await fetch(`/api/org/${orgSlug}/events/${event.slug}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    expectedAttendees: Number(formData.expectedAttendees),
                    startDate: new Date(formData.startDate).toISOString(),
                    endDate: new Date(formData.endDate).toISOString(),
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update event')
            }

            setSuccess('Event settings updated successfully!')
            
            // If slug changed, we need to redirect to the new URL
            if (data.slug !== event.slug) {
                router.push(`/org/${orgSlug}/events/${data.slug}/settings`)
            } else {
                router.refresh()
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card" style={{ padding: '32px', maxWidth: '800px' }}>
            {error && (
                <div className="alert alert-error" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}
            
            {success && (
                <div style={{ padding: '16px', background: 'rgba(0, 255, 128, 0.1)', color: '#00ff80', borderRadius: '12px', marginBottom: '24px', fontWeight: 500 }}>
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div className="form-group">
                        <label className="form-label">Event Name</label>
                        <input required className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">URL Slug</label>
                        <input required className="form-input" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea rows={4} className="form-input" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div className="form-group">
                        <label className="form-label">Event Format</label>
                        <select className="form-input" value={formData.eventType} onChange={e => setFormData({ ...formData, eventType: e.target.value })}>
                            <option value="IN_PERSON">In Person</option>
                            <option value="VIRTUAL">Virtual</option>
                            <option value="HYBRID">Hybrid</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="form-input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                            <option value="DRAFT">Draft</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="LIVE">Live</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div className="form-group">
                        <label className="form-label">Start Date & Time</label>
                        <input type="datetime-local" required className="form-input" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">End Date & Time</label>
                        <input type="datetime-local" required className="form-input" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                    <div className="form-group">
                        <label className="form-label">Venue / Link</label>
                        <input className="form-input" value={formData.venue} onChange={e => setFormData({ ...formData, venue: e.target.value })} placeholder="e.g. Grand Hotel" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">City</label>
                        <input className="form-input" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Country</label>
                        <input className="form-input" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--bg-highlight)', borderRadius: '12px' }}>
                    <input 
                        type="checkbox" 
                        id="isPublic"
                        checked={formData.isPublic} 
                        onChange={e => setFormData({ ...formData, isPublic: e.target.checked })} 
                        style={{ width: '20px', height: '20px', accentColor: 'var(--accent)' }}
                    />
                    <label htmlFor="isPublic" style={{ fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer' }}>
                        Make event public (visible to everyone)
                    </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '12px 24px' }}>
                        <Save size={18} style={{ marginRight: '8px' }} />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    )
}
