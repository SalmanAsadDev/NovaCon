import { NextResponse } from 'next/server'
import { OrgMember, OrgRole } from '@prisma/client'
import { prisma } from './prisma'

type AuthSuccess = { authorized: true; membership: OrgMember }
type AuthFailure = { authorized: false; response: NextResponse }
export type OrgAuthResult = AuthSuccess | AuthFailure

/**
 * Verifies the calling user holds one of `allowedRoles` in the org identified
 * by `orgSlug`. Returns the membership record on success so callers can use
 * `membership.orgId` to scope subsequent queries.
 */
export async function requireOrgRole(
    userId: string,
    orgSlug: string,
    allowedRoles: OrgRole[] = [OrgRole.OWNER, OrgRole.EVENT_MANAGER]
): Promise<OrgAuthResult> {
    const membership = await prisma.orgMember.findFirst({
        where: { userId, org: { slug: orgSlug } },
    })

    if (!membership) {
        return {
            authorized: false,
            response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
        }
    }

    if (!allowedRoles.includes(membership.role)) {
        return {
            authorized: false,
            response: NextResponse.json(
                { error: `Forbidden: requires one of [${allowedRoles.join(', ')}]` },
                { status: 403 }
            ),
        }
    }

    return { authorized: true, membership }
}
