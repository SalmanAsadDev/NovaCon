import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EditSpeakerForm from './EditSpeakerForm'

export default async function EditSpeakerPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const speaker = await prisma.speaker.findUnique({
        where: { id }
    })

    if (!speaker) {
        notFound()
    }

    return (
        <div className="page-fade">
            <EditSpeakerForm speaker={speaker} />
        </div>
    )
}
