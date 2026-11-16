'use client'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import type { Toast, ToastType } from '@/hooks/useToast'

const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 size={16} />,
    error: <AlertCircle size={16} />,
    warning: <AlertTriangle size={16} />,
    info: <Info size={16} />,
}

const colors: Record<ToastType, { color: string; bg: string; border: string }> = {
    success: { color: 'var(--green)', bg: 'var(--green-dim)', border: 'var(--green)' },
    error:   { color: 'var(--red)',   bg: 'rgba(255,80,80,0.1)', border: 'var(--red)' },
    warning: { color: 'var(--amber)', bg: 'rgba(255,180,0,0.1)', border: 'var(--amber)' },
    info:    { color: 'var(--blue)',  bg: 'var(--blue-dim)', border: 'var(--blue)' },
}

export function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const c = colors[toast.type]
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px', borderRadius: '10px',
            background: 'var(--bg-surface)', border: `1px solid ${c.border}`,
            boxShadow: 'var(--shadow-lg)', minWidth: '280px', maxWidth: '420px',
            color: 'var(--text-primary)', fontSize: '14px',
            animation: 'fadeIn 0.2s ease',
        }}>
            <span style={{ color: c.color, flexShrink: 0 }}>{icons[toast.type]}</span>
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', display: 'flex' }}
            >
                <X size={14} />
            </button>
        </div>
    )
}

export function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
    if (toasts.length === 0) return null
    return (
        <div
            role="status"
            aria-live="polite"
            style={{
                position: 'fixed', bottom: '24px', right: '24px',
                display: 'flex', flexDirection: 'column', gap: '10px',
                zIndex: 9999,
            }}
        >
            {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />)}
        </div>
    )
}
