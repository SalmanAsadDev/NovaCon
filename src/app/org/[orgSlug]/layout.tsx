import OrgSidebar from '@/components/layout/OrgSidebar'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function OrgLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ orgSlug: string }>
}) {
    const session = await auth()
    if (!session?.user) redirect('/login')

    const { orgSlug } = await params

    const membership = await prisma.orgMember.findFirst({
        where: {
            userId: session.user.id,
            org: { slug: orgSlug }
        },
        include: { org: true }
    })

    if (!membership) {
        redirect('/onboarding')
    }

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <OrgSidebar org={membership.org} user={session.user} role={membership.role} />
            <main style={{ 
                flex: 1, 
                overflowY: 'auto',
                background: 'var(--bg-base)',
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '300px',
                    background: 'radial-gradient(ellipse at top right, var(--accent-dim) 0%, transparent 70%)',
                    opacity: 0.15, pointerEvents: 'none', zIndex: 0
                }} />
                
                <div style={{ position: 'relative', zIndex: 1, padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    )
}
