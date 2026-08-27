'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
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
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (res?.error) {
                setError('Invalid email or password')
            } else {
                router.push('/dashboard')
                router.refresh()
            }
        } catch (err) {
            setError('An error occurred. Please try again.')
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
                    }}>NovaCon Ops</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Sign in to the event dashboard
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {error && (
                        <div className="alert alert-error">
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@novacon.pk"
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
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ marginTop: '8px', justifyContent: 'center', padding: '12px' }}
                        disabled={loading}
                    >
                        {loading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Sign In'}
                    </button>
                </form>
                
                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                    Don't have an account? NovaCon staff accounts are created by administrators.
                </div>
                
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <Link href="/register" style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 500 }}>
                        Go to public event registration &rarr;
                    </Link>
                </div>
            </div>
        </div>
    )
}
