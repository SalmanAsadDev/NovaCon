'use client'
import { useEffect, useRef, useState } from 'react'

export default function LiveTicker() {
    const ref = useRef<HTMLDivElement>(null)
    const [events, setEvents] = useState<any[]>([])

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch('/api/activity')
                if (!res.ok) return
                const data = await res.json()
                if (Array.isArray(data)) setEvents(data)
            } catch (err) {
                // Silent catch: Ignore transient offline/fetch errors to prevent console spam
            }
        }
        fetchEvents()
        const interval = setInterval(fetchEvents, 10000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const el = ref.current
        if (!el || events.length === 0) return
        let pos = 0
        const speed = 0.5
        let animationId: number
        const tick = () => {
            pos -= speed
            // if scrolled half the width (which is the length of one set of events)
            if (pos < -el.scrollWidth / 2) pos = 0
            el.style.transform = `translateX(${pos}px)`
            animationId = requestAnimationFrame(tick)
        }
        animationId = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(animationId)
    }, [events.length])

    if (events.length === 0) return null

    const doubled = [...events, ...events]

    return (
        <div style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            height: 'var(--ticker-height)',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            flexShrink: 0,
        }}>
            {/* LIVE badge */}
            <div style={{
                flexShrink: 0,
                padding: '0 14px',
                borderRight: '1px solid var(--border)',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--accent-dim)',
                zIndex: 10,
            }}>
                <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: 'var(--accent)', display: 'inline-block',
                    animation: 'pulse 1.5s ease-in-out infinite',
                }} />
                <span style={{
                    fontSize: '10px', fontWeight: 700, color: 'var(--accent)',
                    letterSpacing: '1px', fontFamily: 'Sora, sans-serif',
                }}>LIVE</span>
            </div>

            {/* Scrolling content */}
            <div style={{ overflow: 'hidden', flex: 1, position: 'relative' }}>
                <div ref={ref} style={{ display: 'flex', gap: '0', whiteSpace: 'nowrap', willChange: 'transform' }}>
                    {doubled.map((event, i) => (
                        <span key={i} style={{
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                            padding: '0 32px',
                            borderRight: '1px solid var(--border)',
                        }}>
                            <span style={{ color: 'var(--accent)', marginRight: '6px' }}>◆</span>
                            {event.message} <span style={{ opacity: 0.5, marginLeft: '8px' }}>
                                {new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}