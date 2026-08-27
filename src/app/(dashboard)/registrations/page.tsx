import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import CheckInButton from './CheckInButton'

export default async function RegistrationsPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await auth()
    // @ts-expect-error custom role
    const isAdmin = session?.user?.role === 'ADMIN'
    
    // Only admins can access this page
    if (!isAdmin) {
        redirect('/dashboard')
    }
    
    const resolvedParams = await searchParams
    const search = resolvedParams.search as string | undefined
    const status = resolvedParams.status as string | undefined
    const page = parseInt(resolvedParams.page as string || '1')
    const limit = 15

    const where = {
        ...(status ? { status: status as any } : {}),
        ...(search ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { university: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } },
            ],
        } : {}),
    }

    const [registrations, total] = await Promise.all([
        prisma.registration.findMany({
            where,
            orderBy: { registeredAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.registration.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return (
        <div className="page-fade">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Registrations</h1>
                    <p className="page-subtitle">Manage attendees and check-ins (Admin only)</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <a href="/api/registrations/export" className="btn btn-ghost">
                        Export CSV
                    </a>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '24px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link href="/registrations" className={`btn ${!status ? 'btn-primary' : 'btn-ghost'} btn-sm`}>All</Link>
                    <Link href="/registrations?status=REGISTERED" className={`btn ${status === 'REGISTERED' ? 'btn-primary' : 'btn-ghost'} btn-sm`}>Pending Check-in</Link>
                    <Link href="/registrations?status=CHECKED_IN" className={`btn ${status === 'CHECKED_IN' ? 'btn-primary' : 'btn-ghost'} btn-sm`}>Checked In</Link>
                </div>
                
                {/* Search Form - normally a client component, but we can do it with a simple HTML form for RSC */}
                <form action="/registrations" method="GET" style={{ display: 'flex', gap: '8px' }}>
                    {status && <input type="hidden" name="status" value={status} />}
                    <input 
                        type="text" 
                        name="search" 
                        defaultValue={search || ''} 
                        placeholder="Search name, email, university..." 
                        className="form-input"
                        style={{ width: '250px', padding: '6px 12px', fontSize: '13px' }}
                    />
                    <button type="submit" className="btn btn-ghost btn-sm">Search</button>
                    {search && (
                        <Link href={`/registrations${status ? `?status=${status}` : ''}`} className="btn btn-ghost btn-sm">Clear</Link>
                    )}
                </form>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Attendee</th>
                            <th>University</th>
                            <th>Track / Ticket</th>
                            <th>Status</th>
                            <th>Registered</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registrations.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                                    <div className="empty-state">
                                        <div className="empty-state-icon">≡</div>
                                        <div>No registrations found.</div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            registrations.map(r => (
                                <tr key={r.id}>
                                    <td>
                                        <div style={{ fontWeight: 600, marginBottom: '2px' }}>{r.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.email}</div>
                                    </td>
                                    <td>{r.university}</td>
                                    <td>
                                        <div style={{ marginBottom: '4px' }}>{r.track}</div>
                                        <span className={`badge badge-${r.ticketType.toLowerCase()}`}>
                                            {r.ticketType}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${r.status.toLowerCase().replace('_', '-')}`}>
                                            {r.status === 'CHECKED_IN' ? 'Checked In' : 'Registered'}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                                        {new Date(r.registeredAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {r.status !== 'CHECKED_IN' && (
                                                <CheckInButton id={r.id} />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <div className="pagination-info">Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results</div>
                    
                    {page > 1 && (
                        <Link href={`/registrations?page=${page - 1}${status ? `&status=${status}` : ''}${search ? `&search=${search}` : ''}`} className="btn btn-ghost btn-sm">Previous</Link>
                    )}
                    
                    <span style={{ fontSize: '13px', padding: '0 8px' }}>Page {page} of {totalPages}</span>
                    
                    {page < totalPages && (
                        <Link href={`/registrations?page=${page + 1}${status ? `&status=${status}` : ''}${search ? `&search=${search}` : ''}`} className="btn btn-ghost btn-sm">Next</Link>
                    )}
                </div>
            )}
        </div>
    )
}
