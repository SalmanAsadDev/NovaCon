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
        <header className="mobile-topbar" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
            <div>
                <span style={{
                    fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '18px',
                    color: 'var(--accent)', whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                    {org.name}
                </span>
                {isEventWorkspace && (
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>
                        Event Workspace
                    </div>
                )}
            </div>
            
            <button
                onClick={handleOpen}
                style={{
                    background: 'var(--bg-surface-2)', border: '1px solid var(--border)', cursor: 'pointer',
                    color: 'var(--text-primary)', padding: '8px',
                    display: 'flex', alignItems: 'center', borderRadius: '8px',
                }}
                aria-label="Open navigation menu"
            >
                <Menu size={20} />
            </button>
        </header>
    )
}
