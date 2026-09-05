'use client'
import { useState, useEffect, use } from 'react'
import { Plus, Ticket, Pencil, Trash2, X, DollarSign } from 'lucide-react'

type TicketTier = {
    id: string
    name: string
    price: number
    capacity: number
    sold: number
    features: string[]
    currency: string
}

export default function FinancePage({ params }: { params: Promise<{ orgSlug: string; eventSlug: string }> }) {
    const { orgSlug, eventSlug } = use(params)
    const [tiers, setTiers] = useState<TicketTier[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({ name: 'General Admission', price: 0, capacity: 100, features: 'Access to all sessions, Lunch included' })

    const fetchTiers = async () => {
        try {
            const res = await fetch(`/api/org/${orgSlug}/events/${eventSlug}/tiers`)
            if (res.ok) setTiers(await res.json())
        } catch { /* ignore */ } finally { setLoading(false) }
    }

    useEffect(() => { fetchTiers() }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        const payload = { ...formData, features: formData.features.split(',').map(f => f.trim()).filter(Boolean) }
        try {
            const res = await fetch(`/api/org/${orgSlug}/events/${eventSlug}/tiers`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            })
            if (!res.ok) throw new Error('Failed to create ticket tier')
            setShowForm(false)
            fetchTiers()
        } catch (err: any) { setError(err.message) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this ticket tier?')) return
        await fetch(`/api/org/${orgSlug}/events/${eventSlug}/tiers/${id}`, { method: 'DELETE' })
        fetchTiers()
    }

    const totalRevenue = tiers.reduce((acc, t) => acc + (t.price * t.sold), 0)
    const totalSold = tiers.reduce((acc, t) => acc + t.sold, 0)
    const currency = tiers.length > 0 ? tiers[0].currency : 'USD'
    
    const currencyMap: Record<string, string> = {
        'USD': '$', 'EUR': '€', 'GBP': '£', 'PKR': 'Rs '
    }
    const symbol = currencyMap[currency] || '$'

    return (
        <div className="page-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Finance & Tickets</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Manage ticket pricing and track revenue</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary"><Plus size={16} /> Create Tier</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Total Revenue</div>
                    <div style={{ fontSize: '36px', fontWeight: 700, color: '#00ff80' }}>{symbol}{totalRevenue.toLocaleString()}</div>
                </div>
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Tickets Sold</div>
                    <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)' }}>{totalSold.toLocaleString()}</div>
                </div>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Ticket Tiers</h3>
            
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading tiers...</div>
            ) : tiers.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Ticket size={48} style={{ margin: '0 auto 16px', opacity: 0.3, color: 'var(--text-muted)' }} />
                    <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>No ticket tiers yet</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Create your first ticket tier to start selling.</p>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary">Create Tier</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {tiers.map(t => (
                        <div key={t.id} className="card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <h4 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</h4>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t.sold} / {t.capacity} sold</div>
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 700, color: t.price > 0 ? '#00ff80' : 'var(--text-primary)' }}>
                                    {t.price === 0 ? 'Free' : `${symbol}${t.price}`}
                                </div>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'var(--bg-highlight)', borderRadius: '3px', marginBottom: '24px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: 'var(--accent)', width: `${(t.sold / t.capacity) * 100}%` }} />
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {t.features.map((f, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)' }} />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                                <button onClick={() => handleDelete(t.id)} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', color: 'var(--red)' }}><Trash2 size={16} /> Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="card" style={{ width: '480px', maxWidth: '90vw', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>Create Ticket Tier</h2>
                            <button onClick={() => setShowForm(false)} className="btn btn-ghost" style={{ padding: '4px' }}><X size={20} /></button>
                        </div>
                        {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group"><label className="form-label">Tier Name</label><input required className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group"><label className="form-label">Price</label><input type="number" min={0} required className="form-input" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} /></div>
                                <div className="form-group"><label className="form-label">Capacity</label><input type="number" min={1} required className="form-input" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })} /></div>
                            </div>
                            <div className="form-group"><label className="form-label">Features (comma separated)</label><textarea rows={3} required className="form-input" value={formData.features} onChange={e => setFormData({ ...formData, features: e.target.value })} /></div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Tier</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
