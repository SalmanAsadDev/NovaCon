'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, KeyRound, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function OnboardingPage() {
    const [view, setView] = useState<'selection' | 'create' | 'join'>('selection')
    const [orgName, setOrgName] = useState('')
    const [inviteCode, setInviteCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/org', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: orgName })
            })
            const contentType = res.headers.get('content-type') || ''
            let data: any = {}
            if (contentType.includes('application/json')) {
                data = await res.json()
            }
            
            if (!res.ok) {
                throw new Error(data.error || `Failed to create organization (Status: ${res.status})`)
            }
            
            router.push(`/org/${data.slug}`)
        } catch (err: any) {
            setError(err.message || 'An error occurred while creating the organization')
            setLoading(false)
        }
    }

    const handleJoinOrg = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/org/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: inviteCode })
            })
            const contentType = res.headers.get('content-type') || ''
            let data: any = {}
            if (contentType.includes('application/json')) {
                data = await res.json()
            }
            
            if (!res.ok) {
                throw new Error(data.error || `Invalid or expired invite code (Status: ${res.status})`)
            }
            
            router.push(`/org/${data.slug}`)
        } catch (err: any) {
            setError(err.message || 'An error occurred while joining the organization')
            setLoading(false)
        }
    }

    return (
        <div className="auth-page page-fade">
            <div className="auth-card" style={{ maxWidth: '480px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, var(--accent), #FF8A00)',
                        margin: '0 auto 24px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#0D1117', fontWeight: 700, fontSize: '28px',
                        boxShadow: '0 8px 24px var(--accent-dim)'
                    }}>
                        N
                    </div>
                    <h1 style={{ fontSize: '28px', marginBottom: '8px', color: 'var(--text-primary)' }}>Welcome to NovaCon</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Let's get your workspace set up.</p>
                </div>

                {view === 'selection' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button 
                            onClick={() => setView('create')}
                            className="card card-hover"
                            style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px', textAlign: 'left', border: '1px solid var(--border)' }}
                        >
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--blue-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Building2 size={20} color="var(--blue)" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '16px', marginBottom: '4px', color: 'var(--text-primary)' }}>Create a new Organization</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Set up a new workspace for your company to host events.</p>
                            </div>
                        </button>
                        
                        <button 
                            onClick={() => setView('join')}
                            className="card card-hover"
                            style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px', textAlign: 'left', border: '1px solid var(--border)' }}
                        >
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--purple-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <KeyRound size={20} color="var(--purple)" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '16px', marginBottom: '4px', color: 'var(--text-primary)' }}>Join an existing one</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>I have an invite code from my team administrator.</p>
                            </div>
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            <Link href="/login" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                Sign out
                            </Link>
                        </div>
                    </div>
                )}

                {view === 'create' && (
                    <div className="page-fade">
                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '4px' }}>Organization Details</h2>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>This is your company's home on NovaCon.</p>
                        </div>
                        
                        <form onSubmit={handleCreateOrg}>
                            {error && (
                                <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                                    {error}
                                </div>
                            )}
                            
                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label className="form-label">Company Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={orgName}
                                    onChange={e => setOrgName(e.target.value)}
                                    placeholder="e.g. Acme Events"
                                    className="form-input"
                                    style={{ padding: '12px 16px', fontSize: '15px' }}
                                />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => { setView('selection'); setError('') }}
                                    className="btn btn-ghost"
                                    style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
                                >
                                    Back
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="btn btn-primary"
                                    style={{ flex: 2, padding: '12px', justifyContent: 'center' }}
                                >
                                    {loading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : (
                                        <>Create Workspace <ArrowRight size={16} /></>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {view === 'join' && (
                    <div className="page-fade">
                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '4px' }}>Enter Invite Code</h2>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Paste the 6-character code from your invitation email.</p>
                        </div>
                        
                        <form onSubmit={handleJoinOrg}>
                            {error && (
                                <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                                    {error}
                                </div>
                            )}
                            
                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <input 
                                    type="text" 
                                    required 
                                    value={inviteCode}
                                    onChange={e => setInviteCode(e.target.value.toUpperCase())}
                                    placeholder="XXXXXX"
                                    maxLength={6}
                                    className="form-input"
                                    style={{ 
                                        padding: '16px', 
                                        textAlign: 'center', 
                                        fontSize: '24px', 
                                        letterSpacing: '8px', 
                                        fontFamily: 'monospace',
                                        background: 'var(--bg-base)' 
                                    }}
                                />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => { setView('selection'); setError('') }}
                                    className="btn btn-ghost"
                                    style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
                                >
                                    Back
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="btn btn-primary"
                                    style={{ flex: 2, padding: '12px', justifyContent: 'center', background: 'var(--purple)', color: '#fff' }}
                                >
                                    {loading ? <div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#fff' }} /> : 'Join Workspace'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}
