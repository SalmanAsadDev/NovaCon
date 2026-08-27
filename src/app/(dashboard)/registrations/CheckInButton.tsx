'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CheckInButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleCheckIn = async () => {
        if (!confirm('Are you sure you want to check in this attendee?')) return
        setLoading(true)

        try {
            const res = await fetch(`/api/registrations/${id}/checkin`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
            })
            if (!res.ok) {
                alert('Failed to check in attendee.')
            } else {
                router.refresh()
            }
        } catch (err) {
            alert('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button 
            onClick={handleCheckIn}
            className="btn btn-ghost btn-sm" 
            style={{ color: 'var(--green)' }}
            disabled={loading}
        >
            {loading ? '...' : 'Check In'}
        </button>
    )
}
