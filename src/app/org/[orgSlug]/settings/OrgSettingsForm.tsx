'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, AlertCircle } from 'lucide-react'

export default function OrgSettingsForm({ org }: { org: any }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    
    const [formData, setFormData] = useState({
        name: org.name || '',
        slug: org.slug || '',
        description: org.description || '',
        website: org.website || '',
        country: org.country || '',
        currency: org.currency || 'USD'
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const res = await fetch(`/api/org/${org.slug}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update organization')
            }

            setSuccess('Organization settings updated successfully!')
            
            if (data.slug !== org.slug) {
                router.push(`/org/${data.slug}/settings`)
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
                        <label className="form-label">Organization Name</label>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                    <div className="form-group">
                        <label className="form-label">Website</label>
                        <input className="form-input" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} placeholder="https://" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Country</label>
                        <input className="form-input" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Default Currency</label>
                        <select className="form-input" value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })}>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="PKR">PKR (₨)</option>
                        </select>
                    </div>
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
