'use client'
import React, { useEffect } from 'react'

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void | Promise<void>
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'success' | 'warning' | 'info'
    loading?: boolean
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false,
}: ConfirmModalProps) {
    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !loading) {
                onClose()
            }
        }
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, loading, onClose])

    if (!isOpen) return null

    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    iconBg: 'var(--red-dim)',
                    iconColor: 'var(--red)',
                    iconBorder: 'rgba(248, 81, 73, 0.3)',
                    confirmBtnClass: 'btn btn-danger',
                    icon: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"/>
                        </svg>
                    ),
                }
            case 'success':
                return {
                    iconBg: 'var(--green-dim)',
                    iconColor: 'var(--green)',
                    iconBorder: 'rgba(63, 185, 80, 0.3)',
                    confirmBtnClass: 'btn',
                    confirmBtnCustom: { background: 'var(--green)', color: '#000', fontWeight: 600 },
                    icon: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                    ),
                }
            case 'warning':
                return {
                    iconBg: 'var(--accent-dim)',
                    iconColor: 'var(--accent)',
                    iconBorder: 'rgba(240, 165, 0, 0.3)',
                    confirmBtnClass: 'btn btn-primary',
                    icon: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                    ),
                }
            default:
                return {
                    iconBg: 'var(--blue-dim)',
                    iconColor: 'var(--blue)',
                    iconBorder: 'rgba(88, 166, 255, 0.3)',
                    confirmBtnClass: 'btn btn-primary',
                    icon: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12"/>
                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                    ),
                }
        }
    }

    const vStyle = getVariantStyles()

    return (
        <div 
            className="modal-backdrop"
            onClick={(e) => {
                if (e.target === e.currentTarget && !loading) {
                    onClose()
                }
            }}
        >
            <div className="modal-card" role="dialog" aria-modal="true">
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div 
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: vStyle.iconBg,
                            color: vStyle.iconColor,
                            border: `1px solid ${vStyle.iconBorder}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        {vStyle.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                        <h3 
                            style={{ 
                                fontSize: '17px', 
                                fontWeight: 600, 
                                color: 'var(--text-primary)',
                                marginBottom: '6px',
                                fontFamily: 'Sora, sans-serif'
                            }}
                        >
                            {title}
                        </h3>
                        <p 
                            style={{ 
                                fontSize: '13.5px', 
                                color: 'var(--text-secondary)', 
                                lineHeight: '1.5' 
                            }}
                        >
                            {description}
                        </p>
                    </div>
                </div>

                <div 
                    style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        justifyContent: 'flex-end', 
                        marginTop: '24px',
                        paddingTop: '16px',
                        borderTop: '1px solid var(--border)'
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-ghost"
                        disabled={loading}
                        style={{ padding: '8px 18px' }}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={vStyle.confirmBtnClass}
                        style={{
                            padding: '8px 20px',
                            minWidth: '100px',
                            justifyContent: 'center',
                            ...(vStyle.confirmBtnCustom || {})
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="spinner" style={{ width: '16px', height: '16px' }} />
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
