'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmModal from '@/components/ui/ConfirmModal'

export default function CheckInButton({ id, attendeeName = 'this attendee' }: { id: string, attendeeName?: string }) {
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleCheckIn = async () => {
        setLoading(true)
        setError('')

        try {
            const res = await fetch(`/api/registrations/${id}/checkin`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
            })
            if (!res.ok) {
                setError('Failed to check in attendee.')
                setLoading(false)
                setShowModal(false)
            } else {
                setShowModal(false)
                router.refresh()
            }
        } catch (err) {
            setError('Network error. Please try again.')
            setLoading(false)
            setShowModal(false)
        }
    }

    return (
        <>
            <button 
                onClick={() => setShowModal(true)}
                className="btn btn-ghost btn-sm" 
                style={{ color: 'var(--green)', border: '1px solid rgba(63, 185, 80, 0.3)' }}
                disabled={loading}
            >
                {loading ? 'Checking in...' : 'Check In'}
            </button>

            {error && (
                <span style={{ fontSize: '11px', color: 'var(--red)', marginLeft: '6px' }}>{error}</span>
            )}

            <ConfirmModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleCheckIn}
                title="Confirm Attendee Check-In"
                description={`Check in ${attendeeName}? This will verify their arrival, update real-time event revenue, and broadcast to the live operations ticker.`}
                confirmText="Check In Now"
                cancelText="Cancel"
                variant="success"
                loading={loading}
            />
        </>
    )
}

