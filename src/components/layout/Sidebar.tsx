'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const nav = [
    { href: '/dashboard', label: 'Overview', icon: '▦' },
    { href: '/sessions', label: 'Sessions', icon: '◫' },
    { href: '/speakers', label: 'Speakers', icon: '◉' },
    { href: '/registrations', label: 'Registrations', icon: '≡', adminOnly: true },
    { href: '/analytics', label: 'Analytics', icon: '◈' },
]

export default function Sidebar({ user }: { user: any }) {
    const pathname = usePathname()
    const isAdmin = user?.role === 'ADMIN'

    return (
        <aside style={{
            width: 'var(--sidebar-width)',
            background: 'var(--bg-surface)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            padding: '24px 0',
        }}>
            {/* Brand */}
            <div style={{ padding: '0 20px 28px' }}>
                <div style={{
                    fontFamily: 'Sora, sans-serif',
                    fontWeight: 700,
                    fontSize: '18px',
                    color: 'var(--accent)',
                    letterSpacing: '-0.3px',
                }}>NovaCon</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', letterSpacing: '0.5px' }}>
                    ISLAMABAD 2025
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1 }}>
                {nav.map(({ href, label, icon, adminOnly }) => {
                    if (adminOnly && !isAdmin) return null
                    const active = pathname === href || pathname.startsWith(href + '/')
                    return (
                        <Link key={href} href={href} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 20px',
                            margin: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            color: active ? 'var(--accent)' : 'var(--text-secondary)',
                            background: active ? 'var(--accent-dim)' : 'transparent',
                            fontWeight: active ? 600 : 400,
                            fontSize: '13.5px',
                            transition: 'all 0.15s',
                            borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                        }}>
                            <span style={{ fontSize: '15px', opacity: active ? 1 : 0.6 }}>{icon}</span>
                            {label}
                        </Link>
                    )
                })}
            </nav>

            {/* User Profile & Logout */}
            <div style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'var(--accent)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontWeight: 600, color: '#000', fontSize: '12px'
                    }}>
                        {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{user?.role}</div>
                    </div>
                </div>
                <button 
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="btn btn-ghost" 
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    Logout
                </button>
            </div>
        </aside>
    )
}