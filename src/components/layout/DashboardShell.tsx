'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import LiveTicker from './LiveTicker'

const nav = [
    { href: '/dashboard', label: 'Overview', icon: '▦' },
    { href: '/sessions', label: 'Sessions', icon: '◫' },
    { href: '/speakers', label: 'Speakers', icon: '◉' },
    { href: '/registrations', label: 'Registrations', icon: '≡', adminOnly: true },
    { href: '/analytics', label: 'Analytics', icon: '◈' },
]

export default function DashboardShell({ 
    user, 
    children 
}: { 
    user: any
    children: React.ReactNode 
}) {
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const pathname = usePathname()
    const isAdmin = user?.role === 'ADMIN'

    // Automatically close mobile menu whenever route changes
    useEffect(() => {
        setIsMobileOpen(false)
    }, [pathname])

    // Prevent body scrolling when mobile drawer is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isMobileOpen])

    const renderNavLinks = () => (
        <nav style={{ flex: 1, padding: '12px 0' }}>
            {nav.map(({ href, label, icon, adminOnly }) => {
                if (adminOnly && !isAdmin) return null
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                    <Link 
                        key={href} 
                        href={href}
                        onClick={() => setIsMobileOpen(false)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '11px 20px',
                            margin: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            color: active ? 'var(--accent)' : 'var(--text-secondary)',
                            background: active ? 'var(--accent-dim)' : 'transparent',
                            fontWeight: active ? 600 : 400,
                            fontSize: '13.5px',
                            transition: 'all 0.15s',
                            borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                        }}
                    >
                        <span style={{ fontSize: '15px', opacity: active ? 1 : 0.6 }}>{icon}</span>
                        {label}
                    </Link>
                )
            })}
        </nav>
    )

    const renderUserProfile = () => (
        <div style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: 'var(--accent)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 700, color: '#000', fontSize: '12px',
                    flexShrink: 0
                }}>
                    {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {user?.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {user?.role}
                    </div>
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
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <LiveTicker />

            {/* Mobile Top Navigation Header */}
            <div className="mobile-topbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        type="button"
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className="btn btn-ghost btn-icon"
                        aria-label="Toggle navigation menu"
                        style={{ border: '1px solid var(--border-strong)', padding: '6px' }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {isMobileOpen ? (
                                <path d="M18 6L6 18M6 6l12 12" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                    <div>
                        <div style={{
                            fontFamily: 'Sora, sans-serif',
                            fontWeight: 700,
                            fontSize: '16px',
                            color: 'var(--accent)',
                            lineHeight: 1.2
                        }}>
                            NovaCon
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                            ISLAMABAD 2025
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: 'var(--accent)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontWeight: 700, color: '#000', fontSize: '11px'
                    }}>
                        {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                    </div>
                </div>
            </div>

            {/* Main Flex Layout */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
                {/* Desktop Fixed Sidebar */}
                <aside 
                    className="sidebar-desktop"
                    style={{
                        width: 'var(--sidebar-width)',
                        background: 'var(--bg-surface)',
                        borderRight: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        flexShrink: 0,
                        padding: '24px 0',
                    }}
                >
                    {/* Brand */}
                    <div style={{ padding: '0 20px 24px' }}>
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

                    {renderNavLinks()}
                    {renderUserProfile()}
                </aside>

                {/* Mobile Drawer Backdrop */}
                {isMobileOpen && (
                    <div 
                        className="mobile-drawer-backdrop" 
                        onClick={() => setIsMobileOpen(false)}
                    />
                )}

                {/* Mobile Slide-in Drawer */}
                {isMobileOpen && (
                    <aside className="mobile-drawer">
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '16px 20px', 
                            borderBottom: '1px solid var(--border)' 
                        }}>
                            <div>
                                <div style={{
                                    fontFamily: 'Sora, sans-serif',
                                    fontWeight: 700,
                                    fontSize: '16px',
                                    color: 'var(--accent)',
                                }}>NovaCon</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                    OPS DASHBOARD
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMobileOpen(false)}
                                className="btn btn-ghost btn-icon"
                                style={{ borderRadius: '50%' }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {renderNavLinks()}
                        {renderUserProfile()}
                    </aside>
                )}

                {/* Main Scrollable Viewport */}
                <main 
                    className="dashboard-content-main page-fade" 
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '32px',
                        background: 'var(--bg-base)',
                        WebkitOverflowScrolling: 'touch',
                    }}
                >
                    {children}
                </main>
            </div>
        </div>
    )
}
