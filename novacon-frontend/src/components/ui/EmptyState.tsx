import Link from 'next/link'

export function EmptyState({ icon, title, description, action }: {
    icon?: React.ReactNode
    title: string
    description?: string
    action?: { label: string; href: string }
}) {
    return (
        <div className="card" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', padding: '48px 24px', gap: '8px',
        }}>
            {icon && <div style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '8px' }} aria-hidden="true">{icon}</div>}
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
            {description && <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '360px' }}>{description}</p>}
            {action && (
                <Link href={action.href} className="btn btn-primary" style={{ marginTop: '16px' }}>
                    {action.label}
                </Link>
            )}
        </div>
    )
}
