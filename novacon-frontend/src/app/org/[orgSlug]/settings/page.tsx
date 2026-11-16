import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import OrgSettingsForm from './OrgSettingsForm'

export default async function OrgSettingsPage({ params }: { params: Promise<{ orgSlug: string }> }) {
    const session = await auth()
    if (!session?.user) redirect('/login')

    const { orgSlug } = await params

    const membership = await prisma.orgMember.findFirst({
        where: { userId: session.user.id, org: { slug: orgSlug } },
        include: { org: true }
    })

    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'EVENT_MANAGER')) {
        redirect(`/org/${orgSlug}/events`) // Only Owners and Managers can access Org Settings
    }

    return (
        <div className="page-fade">
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Organization Settings
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Manage details and configuration for {membership.org.name}
                </p>
            </div>
            
            <OrgSettingsForm org={membership.org} />
        </div>
    )
}
