'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        university: '',
        track: 'AI & ML',
        ticketType: 'STANDARD',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Failed to register. Please try again.')
            } else {
                setSuccess(true)
            }
        } catch (err) {
            setError('Network error. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                    <h2 style={{ marginBottom: '8px' }}>Registration Successful!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        Thank you for registering for NovaCon 2025. We've sent a confirmation email to {formData.email}.
                    </p>
                    <button 
                        onClick={() => setSuccess(false)}
                        className="btn btn-primary"
                    >
                        Register Another Person
                    </button>
                    <div style={{ marginTop: '24px' }}>
                        <Link href="/login" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                            &larr; Staff Login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-page" style={{ padding: '40px 20px' }}>
            <div className="auth-card" style={{ maxWidth: '500px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        fontFamily: 'Sora, sans-serif',
                        fontWeight: 700,
                        fontSize: '28px',
                        color: 'var(--accent)',
                        letterSpacing: '-0.5px',
                        marginBottom: '4px'
                    }}>NovaCon 2025</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Attendee Registration Form
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {error && (
                        <div className="alert alert-error">
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <div className="form-grid-2">
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
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">University / Institution</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.university}
                            onChange={(e) => setFormData({...formData, university: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Primary Track</label>
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
                            <label className="form-label">Ticket Type</label>
                            <select
                                className="form-select"
                                value={formData.ticketType}
                                onChange={(e) => setFormData({...formData, ticketType: e.target.value})}
                            >
                                <option value="STANDARD">Standard (PKR 2,500)</option>
                                <option value="PREMIUM">Premium (PKR 5,000)</option>
                                <option value="WORKSHOP">Workshop Only (PKR 3,500)</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ marginTop: '12px', justifyContent: 'center', padding: '12px' }}
                        disabled={loading}
                    >
                        {loading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Complete Registration'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <Link href="/login" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        Are you event staff? Go to login &rarr;
                    </Link>
                </div>
            </div>
        </div>
    )
}
