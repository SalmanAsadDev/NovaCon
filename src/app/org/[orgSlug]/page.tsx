import { redirect } from 'next/navigation'

export default async function OrgDashboardRedirect({ params }: { params: Promise<{ orgSlug: string }> }) {
    const { orgSlug } = await params
    redirect(`/org/${orgSlug}/events`)
}
