'use client'

import { useState } from 'react'
import { Ticket, X, CheckCircle2 } from 'lucide-react'

export default function RegistrationModal({ event, tiers }: { event: any, tiers: any[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedTier, setSelectedTier] = useState<string | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [step, setStep] = useState<1 | 2 | 3>(1) // 1: Select Tier, 2: Details, 3: Success
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        university: '',
        track: 'General'
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedTier) return
        
        setLoading(true)
        setError('')

        try {
            const res = await fetch(`/api/public/events/${event.slug}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    ticketTierId: selectedTier,
                    quantity
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Registration failed')

            setStep(3) // Success
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Currency map helper
    const currencyMap: Record<string, string> = { 'USD': '$', 'EUR': '€', 'GBP': '£', 'PKR': 'Rs ' }

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '18px', borderRadius: '30px' }}>
                <Ticket size={20} style={{ marginRight: '8px' }} />
                Get Tickets
            </button>

            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '560px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', padding: 0 }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Get Tickets - {event.name}</h2>
                            <button onClick={() => setIsOpen(false)} className="btn btn-ghost" style={{ padding: '4px' }}><X size={20} /></button>
                        </div>
                        
                        <div style={{ padding: '32px' }}>
                            {step === 1 && (
                                <div>
                                    <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Select Ticket Type</h3>
                                    {tiers.length === 0 ? (
                                        <div className="alert">No tickets available at this time.</div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {tiers.map(tier => {
                                                const symbol = currencyMap[tier.currency] || '$'
                                                return (
                                                    <div 
                                                        key={tier.id} 
                                                        onClick={() => setSelectedTier(tier.id)}
                                                        className={`card card-hover ${selectedTier === tier.id ? 'active' : ''}`}
                                                        style={{ 
                                                            padding: '20px', cursor: 'pointer', 
                                                            border: selectedTier === tier.id ? '2px solid var(--accent)' : '1px solid var(--border)' 
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>{tier.name}</div>
                                                            <div style={{ fontSize: '20px', fontWeight: 700, color: tier.price > 0 ? '#00ff80' : 'var(--text-primary)' }}>
                                                                {tier.price === 0 ? 'Free' : `${symbol}${tier.price}`}
                                                            </div>
                                                        </div>
                                                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                                            {tier.description || 'Standard access'}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            <button 
                                                onClick={() => setStep(2)} 
                                                disabled={!selectedTier}
                                                className="btn btn-primary" 
                                                style={{ width: '100%', padding: '16px', marginTop: '16px', justifyContent: 'center' }}
                                            >
                                                Continue
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 2 && (
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <h3 style={{ fontSize: '18px' }}>Attendee Details</h3>
                                        <button type="button" onClick={() => setStep(1)} className="btn btn-ghost" style={{ fontSize: '13px' }}>&larr; Back</button>
                                    </div>
                                    
                                    {error && <div className="alert alert-error">{error}</div>}

                                    <div className="form-group">
                                        <label className="form-label">Full Name *</label>
                                        <input required className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address *</label>
                                        <input type="email" required className="form-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Phone Number</label>
                                            <input className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Company / University *</label>
                                            <input required className="form-input" value={formData.university} onChange={e => setFormData({ ...formData, university: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Number of Tickets (Max 10)</label>
                                        <select className="form-input" value={quantity} onChange={e => setQuantity(Number(e.target.value))}>
                                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                                <option key={n} value={n}>{n}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-highlight)', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                            <span>Subtotal ({quantity} {quantity === 1 ? 'ticket' : 'tickets'})</span>
                                            <span>
                                                {tiers.find(t => t.id === selectedTier)?.price === 0 
                                                    ? 'Free' 
                                                    : `${currencyMap[tiers.find(t => t.id === selectedTier)?.currency] || '$'}${(tiers.find(t => t.id === selectedTier)?.price || 0) * quantity}`}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                            <span>Total Due</span>
                                            <span>
                                                {tiers.find(t => t.id === selectedTier)?.price === 0 
                                                    ? 'Free' 
                                                    : `${currencyMap[tiers.find(t => t.id === selectedTier)?.currency] || '$'}${(tiers.find(t => t.id === selectedTier)?.price || 0) * quantity}`}
                                            </span>
                                        </div>
                                    </div>

                                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '16px', justifyContent: 'center' }}>
                                        {loading ? 'Processing...' : 'Complete Registration'}
                                    </button>
                                </form>
                            )}

                            {step === 3 && (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <CheckCircle2 size={64} style={{ color: '#00ff80', margin: '0 auto 24px' }} />
                                    <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Registration Complete!</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '32px' }}>
                                        We've sent a confirmation email to <strong>{formData.email}</strong>.<br/>
                                        See you at the event!
                                    </p>
                                    <button onClick={() => setIsOpen(false)} className="btn btn-primary" style={{ padding: '12px 32px' }}>
                                        Close Window
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
