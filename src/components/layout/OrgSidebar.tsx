'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Menu, X } from 'lucide-react'

export default function OrgSidebar({ org, user, role }: { org: any, user: any, role: string }) {
    const pathname = usePathname()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    // Determine if we are inside an event workspace
    const eventMatch = pathname.match(/\/events\/([^/]+)/)
    const activeEventSlug = eventMatch ? eventMatch[1] : null

    const orgNav = [
        { href: `/org/${org.slug}/events`, label: 'Events', icon: '▦' },
        { href: `/org/${org.slug}/settings`, label: 'Org Settings', icon: '◫' },
    ]

    const eventNav = activeEventSlug ? [
        { href: `/org/${org.slug}/events/${activeEventSlug}/overview`, label: 'Overview', icon: '▦' },
        { href: `/org/${org.slug}/events/${activeEventSlug}/attendees`, label: 'Attendees', icon: '≡' },
        { href: `/org/${org.slug}/events/${activeEventSlug}/speakers`, label: 'Speakers', icon: '◉' },
        { href: `/org/${org.slug}/events/${activeEventSlug}/sessions`, label: 'Sessions', icon: '◫' },
        { href: `/org/${org.slug}/events/${activeEventSlug}/finance`, label: 'Finance', icon: '◈' },
        { href: `/org/${org.slug}/events/${activeEventSlug}/settings`, label: 'Settings', icon: '⚙' },
    ] : []

    const navToRender = activeEventSlug ? eventNav : orgNav

    const renderContent = () => (
        <>
            {/* Brand */}
            <div style={{ padding: '0 20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{
                        fontFamily: 'Sora, sans-serif',
                        fontWeight: 700,
                        fontSize: '18px',
                        color: 'var(--accent)',
                        letterSpacing: '-0.3px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>{org.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', letterSpacing: '0.5px' }}>
                        {activeEventSlug ? 'EVENT WORKSPACE' : 'ORGANIZATION'}
                    </div>
                    {activeEventSlug && (
                        <Link href={`/org/${org.slug}/events`} onClick={() => setIsMobileOpen(false)} style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '8px', display: 'inline-block' }}>
                            ← Back to Events
                        </Link>
                    )}
                </div>
                {/* Close button for mobile */}
                <button 
                    className="btn btn-ghost btn-icon" 
                    style={{ display: isMobileOpen ? 'flex' : 'none', border: 'none' }}
                    onClick={() => setIsMobileOpen(false)}
                >
                    <X size={20} />
                </button>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1 }}>
                {navToRender.map(({ href, label, icon }) => {
                    const active = pathname === href || pathname.startsWith(href + '/') && label !== 'Overview' && label !== 'Events'
                    return (
                        <Link key={href} href={href} onClick={() => setIsMobileOpen(false)} style={{
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
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{role}</div>
                    </div>
                </div>
                <button 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="btn btn-ghost" 
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    Logout
                </button>
            </div>
        </>
    )

    return (
        <div className="sidebar-container" style={{ flexShrink: 0 }}>
            {/* Mobile Topbar */}
            <div className="mobile-topbar">
                <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{org.name}</div>
                <button className="btn btn-ghost btn-icon" style={{ border: 'none' }} onClick={() => setIsMobileOpen(true)}>
                    <Menu size={20} />
                </button>
            </div>

            {/* Mobile Drawer Backdrop */}
            {isMobileOpen && (
                <div className="mobile-drawer-backdrop" onClick={() => setIsMobileOpen(false)} />
            )}

            {/* Mobile Drawer */}
            {isMobileOpen && (
                <aside className="mobile-drawer" style={{ padding: '24px 0' }}>
                    {renderContent()}
                </aside>
            )}

            {/* Desktop Sidebar */}
            <aside className="sidebar-desktop" style={{
                width: 'var(--sidebar-width)',
                background: 'var(--bg-surface)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                padding: '24px 0',
            }}>
                {renderContent()}
            </aside>
        </div>
    )
}
