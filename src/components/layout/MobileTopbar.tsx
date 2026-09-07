'use client'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

export const OPEN_SIDEBAR_EVENT = 'novacon:open-sidebar'

export default function MobileTopbar({ org }: { org: any }) {
    const pathname = usePathname()
    const isEventWorkspace = /\/events\/([^/]+)/.test(pathname)

    const handleOpen = () => {
        window.dispatchEvent(new CustomEvent(OPEN_SIDEBAR_EVENT))
    }

    return (
        <header className="mobile-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                    onClick={handleOpen}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-primary)', padding: '6px',
                        display: 'flex', alignItems: 'center', borderRadius: '8px',
                    }}
                    aria-label="Open navigation menu"
                >
                    <Menu size={22} />
                </button>
                <span style={{
                    fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '16px',
                    color: 'var(--accent)', whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px',
                }}>
                    {org.name}
                </span>
            </div>
            {isEventWorkspace && (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Event Workspace
                </span>
            )}
        </header>
    )
}
