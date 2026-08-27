import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EditSessionForm from './EditSessionForm'

export default async function EditSessionPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    
    // Fetch session and all speakers for the dropdown
    const [session, speakers] = await Promise.all([
        prisma.session.findUnique({
            where: { id }
        }),
        prisma.speaker.findMany({
            select: { id: true, name: true }
        })
    ])

    if (!session) {
        notFound()
    }

    return (
        <div className="page-fade">
            <EditSessionForm session={session} speakers={speakers} />
        </div>
    )
}
