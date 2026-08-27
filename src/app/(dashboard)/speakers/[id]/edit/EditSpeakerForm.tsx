'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Speaker {
    id: string
    name: string
    jobTitle: string
    track: string
    bio: string
    avatar: string
}

export default function EditSpeakerForm({ speaker }: { speaker: Speaker }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    
    const [formData, setFormData] = useState({
        name: speaker.name,
        jobTitle: speaker.jobTitle,
        track: speaker.track,
        bio: speaker.bio,
        avatar: speaker.avatar,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Auto initials generator if avatar input was cleared
        let avatar = formData.avatar
        if (!avatar) {
            avatar = formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        }

        try {
            const res = await fetch(`/api/speakers/${speaker.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, avatar }),
            })
            
            if (!res.ok) {
                const data = await res.json()
                setError(data.error ? JSON.stringify(data.error) : 'Failed to update speaker')
            } else {
                router.push('/speakers')
                router.refresh()
            }
        } catch (err) {
            setError('Network error')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this speaker? This will detach the speaker from all scheduled sessions.')) return
        setLoading(true)
        setError('')

        try {
            const res = await fetch(`/api/speakers/${speaker.id}`, {
                method: 'DELETE',
            })

            if (!res.ok) {
                setError('Failed to delete speaker')
                setLoading(false)
            } else {
                router.push('/speakers')
                router.refresh()
            }
        } catch (err) {
            setError('Network error')
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Edit Speaker</h1>
                    <p className="page-subtitle">Update biography and details for: {speaker.name}</p>
                </div>
                <Link href="/speakers" className="btn btn-ghost">Cancel</Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div className="card">
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {error && <div className="alert alert-error">{error}</div>}
                        
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Job Title / Company</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.jobTitle}
                                onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                                required
                            />
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Avatar Initials</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.avatar}
                                    onChange={(e) => setFormData({...formData, avatar: e.target.value.substring(0, 3).toUpperCase()})}
                                    placeholder="SK"
                                    maxLength={3}
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Biography</label>
                            <textarea
                                className="form-input"
                                rows={4}
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                required
                                minLength={10}
                            />
                        </div>
                        
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center' }}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '15px', color: 'var(--red)' }}>Danger Zone</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Deleting this speaker will remove them permanently. Scheduled sessions for this speaker will be set to TBA.
                    </p>
                    <button 
                        type="button" 
                        onClick={handleDelete} 
                        className="btn btn-danger" 
                        disabled={loading}
                        style={{ justifyContent: 'center', width: '100%' }}
                    >
                        Delete Speaker
                    </button>
                </div>
            </div>
        </div>
    )
}
