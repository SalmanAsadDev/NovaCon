'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewSpeakerPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    
    const [formData, setFormData] = useState({
        name: '',
        jobTitle: '',
        track: 'AI & ML',
        bio: '',
        avatar: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Generate avatar initials if empty
        let avatar = formData.avatar
        if (!avatar) {
            avatar = formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        }

        try {
            const res = await fetch('/api/speakers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, avatar }),
            })
            
            if (!res.ok) {
                const data = await res.json()
                setError(data.error ? JSON.stringify(data.error) : 'Failed to create speaker')
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

    return (
        <div className="page-fade">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Add Speaker</h1>
                    <p className="page-subtitle">Register a new speaker for the conference</p>
                </div>
                <Link href="/speakers" className="btn btn-ghost">Cancel</Link>
            </div>

            <div className="card" style={{ maxWidth: '600px' }}>
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
                            <label className="form-label">Avatar Initials (Optional)</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.avatar}
                                onChange={(e) => setFormData({...formData, avatar: e.target.value.substring(0, 3).toUpperCase()})}
                                placeholder="Auto-generated if empty"
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
                        {loading ? 'Saving...' : 'Save Speaker'}
                    </button>
                </form>
            </div>
        </div>
    )
}
