'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Search, Mic2, Pencil, Trash2, X } from 'lucide-react'

type Speaker = {
    id: string
    name: string
    jobTitle: string
    track: string
    bio: string
    avatar: string
    createdAt: string
}

export default function SpeakersPage({ params }: { params: Promise<{ orgSlug: string; eventSlug: string }> }) {
    const { orgSlug, eventSlug } = use(params)
    const [speakers, setSpeakers] = useState<Speaker[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({ name: '', jobTitle: '', track: 'AI / ML', bio: '', avatar: '' })

    const tracks = ['AI / ML', 'Cloud & DevOps', 'Web3 & Blockchain', 'Cybersecurity', 'Mobile & Frontend', 'Data Engineering']

    const fetchSpeakers = async () => {
        try {
            const res = await fetch(`/api/org/${orgSlug}/events/${eventSlug}/speakers`)
            if (res.ok) {
                const data = await res.json()
                setSpeakers(data)
            }
        } catch { /* ignore */ } finally { setLoading(false) }
    }

    useEffect(() => { fetchSpeakers() }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        const url = editingId
            ? `/api/org/${orgSlug}/events/${eventSlug}/speakers/${editingId}`
            : `/api/org/${orgSlug}/events/${eventSlug}/speakers`
        const method = editingId ? 'PATCH' : 'POST'

        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
            if (!res.ok) {
                const d = await res.json().catch(() => ({}))
                throw new Error(d.error || 'Failed to save speaker')
            }
            setShowForm(false)
            setEditingId(null)
            setFormData({ name: '', jobTitle: '', track: 'AI / ML', bio: '', avatar: '' })
            fetchSpeakers()
        } catch (err: any) { setError(err.message) }
    }

    const handleDelete = (id: string) => {
        setDeleteConfirmId(id)
    }

    const executeDelete = async () => {
        if (!deleteConfirmId) return
        await fetch(`/api/org/${orgSlug}/events/${eventSlug}/speakers/${deleteConfirmId}`, { method: 'DELETE' })
        setDeleteConfirmId(null)
        fetchSpeakers()
    }

    const startEdit = (s: Speaker) => {
        setFormData({ name: s.name, jobTitle: s.jobTitle, track: s.track, bio: s.bio, avatar: s.avatar })
        setEditingId(s.id)
        setShowForm(true)
    }

    const filtered = speakers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.track.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="page-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                        Speakers
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{speakers.length} speaker{speakers.length !== 1 ? 's' : ''} registered</p>
                </div>
                <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', jobTitle: '', track: 'AI / ML', bio: '', avatar: '' }) }} className="btn btn-primary">
                    <Plus size={16} /> Add Speaker
                </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '400px' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                    type="text"
                    placeholder="Search speakers..."
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Speaker Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading speakers...</div>
            ) : filtered.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Mic2 size={48} style={{ margin: '0 auto 16px', opacity: 0.3, color: 'var(--text-muted)' }} />
                    <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>No speakers yet</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Add your first keynote speaker to get started.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {filtered.map(s => (
                        <div key={s.id} className="card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '50%',
                                    background: 'var(--accent-dim)', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontWeight: 700, color: 'var(--accent)', fontSize: '16px', flexShrink: 0
                                }}>
                                    {s.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px' }}>{s.name}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{s.jobTitle}</div>
                                </div>
                            </div>
                            <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '12px', background: 'var(--bg-highlight)', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '12px' }}>
                                {s.track}
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px', lineHeight: '1.5', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                                {s.bio || 'No bio provided.'}
                            </p>
                            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                                <button onClick={() => startEdit(s)} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: '12px', padding: '6px' }}>
                                    <Pencil size={14} /> Edit
                                </button>
                                <button onClick={() => handleDelete(s.id)} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: '12px', padding: '6px', color: 'var(--red)' }}>
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Form */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="card" style={{ width: '480px', maxWidth: '90vw', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>{editingId ? 'Edit Speaker' : 'Add Speaker'}</h2>
                            <button onClick={() => { setShowForm(false); setError('') }} className="btn btn-ghost" style={{ padding: '4px' }}><X size={20} /></button>
                        </div>
                        {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group"><label className="form-label">Full Name *</label><input required className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                            <div className="form-group"><label className="form-label">Job Title *</label><input required className="form-input" value={formData.jobTitle} onChange={e => setFormData({ ...formData, jobTitle: e.target.value })} placeholder="e.g. CTO at TechCorp" /></div>
                            <div className="form-group">
                                <label className="form-label">Track *</label>
                                <select className="form-input" value={formData.track} onChange={e => setFormData({ ...formData, track: e.target.value })}>
                                    {tracks.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-group"><label className="form-label">Bio</label><textarea rows={3} className="form-input" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} placeholder="Brief speaker biography..." /></div>
                            <div className="form-group"><label className="form-label">Avatar URL</label><input className="form-input" value={formData.avatar} onChange={e => setFormData({ ...formData, avatar: e.target.value })} placeholder="https://..." /></div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                                <button type="button" onClick={() => { setShowForm(false); setError('') }} className="btn btn-ghost">Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Add Speaker'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="card" style={{ width: '400px', maxWidth: '90vw', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>Confirm Deletion</h2>
                            <button onClick={() => setDeleteConfirmId(null)} className="btn btn-ghost" style={{ padding: '4px' }}><X size={20} /></button>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
                            Are you sure you want to delete this speaker? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setDeleteConfirmId(null)} className="btn btn-ghost">Cancel</button>
                            <button onClick={executeDelete} className="btn" style={{ background: 'var(--red)', color: 'white', border: 'none' }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
