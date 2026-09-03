'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmModal from '@/components/ui/ConfirmModal'

export default function DeleteSpeakerButton({ id, speakerName }: { id: string, speakerName: string }) {
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleDelete = async () => {
        setLoading(true)
        setError('')

        try {
            const res = await fetch(`/api/speakers/${id}`, {
                method: 'DELETE',
            })

            if (!res.ok) {
                setError('Failed to delete speaker')
                setLoading(false)
                setShowModal(false)
            } else {
                setShowModal(false)
                router.refresh()
            }
        } catch (err) {
            setError('Network error')
            setLoading(false)
            setShowModal(false)
        }
    }

    return (
        <>
            <button 
                type="button"
                onClick={() => setShowModal(true)} 
                className="btn btn-danger btn-sm"
                disabled={loading}
            >
                Delete
            </button>

            {error && (
                <span style={{ fontSize: '11px', color: 'var(--red)', display: 'block', marginTop: '4px' }}>
                    {error}
                </span>
            )}

            <ConfirmModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleDelete}
                title="Delete Speaker"
                description={`Are you sure you want to delete ${speakerName}? This will remove their speaker profile and unassign them from any conference sessions.`}
                confirmText="Delete Speaker"
                cancelText="Cancel"
                variant="danger"
                loading={loading}
            />
        </>
    )
}
