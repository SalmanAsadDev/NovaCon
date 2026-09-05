import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function DashboardRoot() {
    const session = await auth()
    if (!session?.user) redirect('/login')

    const membership = await prisma.orgMember.findFirst({
        where: { userId: session.user.id },
        include: { org: true },
        orderBy: { joinedAt: 'asc' }
    })

    if (!membership) {
        redirect('/onboarding')
    }

    redirect(`/org/${membership.org.slug}`)
}
