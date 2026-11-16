function Bone({ width = '100%', height = '16px', borderRadius = '6px', style }: {
    width?: string; height?: string; borderRadius?: string; style?: React.CSSProperties
}) {
    return (
        <div style={{
            width, height, borderRadius,
            background: 'var(--bg-surface-elevated)',
            backgroundImage: 'linear-gradient(90deg, var(--bg-surface-elevated) 25%, var(--bg-highlight) 50%, var(--bg-surface-elevated) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeletonShimmer 1.5s infinite',
            ...style
        }} aria-hidden="true" />
    )
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '24px' }}>
                {Array.from({ length: cols }).map((_, i) => (
                    <Bone key={i} width={i === 0 ? '30%' : '15%'} height="12px" />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '24px', alignItems: 'center' }}>
                    {Array.from({ length: cols }).map((_, i) => (
                        <Bone key={i} width={i === 0 ? '30%' : '15%'} height="14px" />
                    ))}
                </div>
            ))}
        </div>
    )
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
    return (
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Bone width="40%" height="12px" />
            <Bone width="80%" height="28px" />
            {Array.from({ length: lines - 1 }).map((_, i) => (
                <Bone key={i} width={i === lines - 2 ? '60%' : '100%'} height="14px" />
            ))}
        </div>
    )
}

export function SkeletonKpiGrid({ count = 4 }: { count?: number }) {
    return (
        <div className="kpi-grid">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="kpi-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Bone width="50%" height="12px" />
                    <Bone width="60%" height="32px" />
                    <Bone width="40%" height="10px" />
                </div>
            ))}
        </div>
    )
}
