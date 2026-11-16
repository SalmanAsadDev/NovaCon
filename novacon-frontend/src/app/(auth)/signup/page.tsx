'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to create account')
                setLoading(false)
                return
            }

            // Auto log in after signup
            const signInRes = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (signInRes?.error) {
                setError('Account created, but failed to automatically log in.')
            } else {
                router.push('/onboarding')
                router.refresh()
            }
        } catch (err) {
            setError('An unexpected error occurred.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        fontFamily: 'Sora, sans-serif',
                        fontWeight: 700,
                        fontSize: '28px',
                        color: 'var(--accent)',
                        letterSpacing: '-0.5px',
                        marginBottom: '4px'
                    }}>Join NovaCon</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Create an account to organize events
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {error && (
                        <div className="alert alert-error">
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            minLength={6}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ marginTop: '8px', justifyContent: 'center', padding: '12px' }}
                        disabled={loading}
                    >
                        {loading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Create Account'}
                    </button>
                </form>
                
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <Link href="/login" style={{ color: 'var(--accent)', fontSize: '14px', fontWeight: 500 }}>
                        Already have an account? Sign In &rarr;
                    </Link>
                </div>
            </div>
        </div>
    )
}
