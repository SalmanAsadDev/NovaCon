'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { X, CalendarDays, Settings, LayoutDashboard, Users, Mic, Layers, DollarSign, ArrowLeft } from 'lucide-react'

const OPEN_SIDEBAR_EVENT = 'novacon:open-sidebar'

export default function OrgSidebar({ org, user, role }: { org: any, user: any, role: string }) {
    const pathname = usePathname()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    // Close drawer on route change
    useEffect(() => { setIsMobileOpen(false) }, [pathname])

    // Listen for open event from MobileTopbar
    useEffect(() => {
        const handler = () => setIsMobileOpen(true)
        window.addEventListener(OPEN_SIDEBAR_EVENT, handler)
        return () => window.removeEventListener(OPEN_SIDEBAR_EVENT, handler)
    }, [])

    // Prevent body scroll when drawer is open
    useEffect(() => {
        document.body.style.overflow = isMobileOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isMobileOpen])

    const eventMatch = pathname.match(/\/events\/([^/]+)/)
    const activeEventSlug = eventMatch ? eventMatch[1] : null

    const orgNav = [
        { href: `/org/${org.slug}/events`, label: 'Events', icon: <CalendarDays size={18} /> },
        { href: `/org/${org.slug}/settings`, label: 'Org Settings', icon: <Settings size={18} /> },
    ]

    const eventNav = activeEventSlug ? [
        { href: `/org/${org.slug}/events/${activeEventSlug}/overview`, label: 'Overview', icon: <LayoutDashboard size={18} /> },
        { href: `/org/${org.slug}/events/${activeEventSlug}/attendees`, label: 'Attendees', icon: <Users size={18} /> },
        { href: `/org/${org.slug}/events/${activeEventSlug}/speakers`, label: 'Speakers', icon: <Mic size={18} /> },
        { href: `/org/${org.slug}/events/${activeEventSlug}/sessions`, label: 'Sessions', icon: <Layers size={18} /> },
        { href: `/org/${org.slug}/events/${activeEventSlug}/finance`, label: 'Finance', icon: <DollarSign size={18} /> },
        { href: `/org/${org.slug}/events/${activeEventSlug}/settings`, label: 'Settings', icon: <Settings size={18} /> },
    ] : []

    const navToRender = activeEventSlug ? eventNav : orgNav

    const navContent = (
        <>
            <div style={{ padding: '20px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
                <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--accent)', letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{org.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        {activeEventSlug ? 'Event Workspace' : 'Organization'}
                    </div>
                    {activeEventSlug && (
                        <Link href={`/org/${org.slug}/events`} style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ArrowLeft size={12} /> Back to Events
                        </Link>
                    )}
                </div>
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="sidebar-close-btn"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px', flexShrink: 0, marginLeft: '8px' }}
                    aria-label="Close menu"
                >
                    <X size={18} />
                </button>
            </div>

            <nav style={{ flex: 1, padding: '4px 0', overflowY: 'auto' }}>
                {navToRender.map(({ href, label, icon }) => {
                    const active = pathname === href || (pathname.startsWith(href + '/') && label !== 'Overview' && label !== 'Events')
                    return (
                        <Link key={href} href={href} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '11px 20px', margin: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            color: active ? 'var(--accent)' : 'var(--text-secondary)',
                            background: active ? 'var(--accent-dim)' : 'transparent',
                            fontWeight: active ? 600 : 400, fontSize: '14px',
                            transition: 'all 0.15s',
                            borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', opacity: active ? 1 : 0.6, flexShrink: 0 }}>{icon}</span>
                            {label}
                        </Link>
                    )
                })}
            </nav>

            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#000', fontSize: '12px', flexShrink: 0 }}>
                        {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                    </div>
                    <div style={{ overflow: 'hidden', minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{role}</div>
                    </div>
                </div>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}>
                    Logout
                </button>
            </div>
        </>
    )

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                onClick={() => setIsMobileOpen(false)}
                className="mobile-only-backdrop"
                style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(4px)', zIndex: 998,
                    opacity: isMobileOpen ? 1 : 0,
                    pointerEvents: isMobileOpen ? 'auto' : 'none',
                    transition: 'opacity 0.25s ease',
                    display: 'none',
                }}
            />

            {/* Mobile Drawer (slide from left) */}
            <aside
                className="mobile-sidebar-drawer"
                style={{
                    position: 'fixed', top: 0, left: 0, bottom: 0,
                    width: '280px', maxWidth: '85vw',
                    background: 'var(--bg-surface)',
                    borderRight: '1px solid var(--border)',
                    zIndex: 999,
                    display: 'flex', flexDirection: 'column',
                    transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isMobileOpen ? '12px 0 40px rgba(0,0,0,0.6)' : 'none',
                }}
            >
                {navContent}
            </aside>

            {/* Desktop Sidebar */}
            <aside
                className="sidebar-desktop"
                style={{
                    width: 'var(--sidebar-width)',
                    background: 'var(--bg-surface)',
                    borderRight: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    flexShrink: 0,
                    overflow: 'hidden',
                }}
            >
                {navContent}
            </aside>
        </>
    )
}

