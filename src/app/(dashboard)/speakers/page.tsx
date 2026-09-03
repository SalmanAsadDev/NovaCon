import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DeleteSpeakerButton from './DeleteSpeakerButton'

export default async function SpeakersPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await auth()
    const isAdmin = session?.user?.role === 'ADMIN'
    
    const resolvedParams = await searchParams
    const trackFilter = resolvedParams.track as string | undefined

    const speakers = await prisma.speaker.findMany({
        where: trackFilter ? { track: trackFilter } : {},
        include: { sessions: { select: { id: true, title: true, status: true } } },
        orderBy: { name: 'asc' },
    })

    return (
        <div className="page-fade">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Speakers</h1>
                    <p className="page-subtitle">World-class experts leading sessions at NovaCon</p>
                </div>
                {isAdmin && (
                    <Link href="/speakers/new" className="btn btn-primary">
                        + Add Speaker
                    </Link>
                )}
            </div>

            <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Link href="/speakers" className={`btn ${!trackFilter ? 'btn-primary' : 'btn-ghost'} btn-sm`}>All Tracks</Link>
                    <Link href="/speakers?track=AI & ML" className={`btn ${trackFilter === 'AI & ML' ? 'btn-primary' : 'btn-ghost'} btn-sm`}>AI & ML</Link>
                    <Link href="/speakers?track=Web Dev" className={`btn ${trackFilter === 'Web Dev' ? 'btn-primary' : 'btn-ghost'} btn-sm`}>Web Dev</Link>
                    <Link href="/speakers?track=Cybersecurity" className={`btn ${trackFilter === 'Cybersecurity' ? 'btn-primary' : 'btn-ghost'} btn-sm`}>Cybersecurity</Link>
                    <Link href="/speakers?track=DevOps" className={`btn ${trackFilter === 'DevOps' ? 'btn-primary' : 'btn-ghost'} btn-sm`}>DevOps</Link>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                {speakers.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1' }} className="empty-state card">
                        <div className="empty-state-icon">◉</div>
                        <div>No speakers found for this track.</div>
                    </div>
                ) : (
                    speakers.map(speaker => (
                        <div key={speaker.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{
                                    width: '56px', height: '56px', borderRadius: '50%',
                                    background: 'var(--bg-surface-2)', border: '1px solid var(--border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0
                                }}>
                                    {speaker.avatar}
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <h3 style={{ fontSize: '16px', marginBottom: '2px', wordBreak: 'break-word' }}>{speaker.name}</h3>
                                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '8px', wordBreak: 'break-word' }}>{speaker.jobTitle}</div>
                                    <span className="badge" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}>
                                        {speaker.track}
                                    </span>
                                </div>
                            </div>
                            
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', flex: 1, lineHeight: '1.5' }}>
                                {speaker.bio}
                            </p>
                            
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: 'auto' }}>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                                    Sessions ({speaker.sessions.length})
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {speaker.sessions.length === 0 ? (
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No sessions assigned.</div>
                                    ) : (
                                        speaker.sessions.map(s => (
                                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                                <div style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {s.title}
                                                </div>
                                                {s.status === 'LIVE' && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', flexShrink: 0, animation: 'pulse 1.5s infinite' }}></span>}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            
                            {isAdmin && (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                    <Link href={`/speakers/${speaker.id}/edit`} className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Edit</Link>
                                    <DeleteSpeakerButton id={speaker.id} speakerName={speaker.name} />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
