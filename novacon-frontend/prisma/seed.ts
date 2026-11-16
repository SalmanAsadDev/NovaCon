import { PrismaClient, OrgRole, EventStatus, SessionStatus, RegistrationStatus, FinanceType, PaymentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding NovaCon database (Phase 2 Multi-Tenant)...')

    // Clean up existing data to avoid conflicts during seed
    await prisma.financeRecord.deleteMany()
    await prisma.registration.deleteMany()
    await prisma.session.deleteMany()
    await prisma.speaker.deleteMany()
    await prisma.ticketTier.deleteMany()
    await prisma.eventMember.deleteMany()
    await prisma.event.deleteMany()
    await prisma.orgMember.deleteMany()
    await prisma.organization.deleteMany()
    await prisma.user.deleteMany()

    // ─── 1. Users ────────────────────────────────────────────────────────────
    const adminPassword = await bcrypt.hash('Admin@1234', 12)
    const viewerPassword = await bcrypt.hash('Viewer@1234', 12)

    const owner = await prisma.user.create({
        data: {
            email: 'admin@novacon.pk',
            name: 'Admin User',
            password: adminPassword,
        },
    })

    const staffUser = await prisma.user.create({
        data: {
            email: 'viewer@novacon.pk',
            name: 'Viewer User',
            password: viewerPassword,
        },
    })
    console.log('✅ Users created')

    // ─── 2. Organization ──────────────────────────────────────────────────────
    const org = await prisma.organization.create({
        data: {
            name: 'Nova Events Pvt Ltd',
            slug: 'nova-events',
            description: 'Leading tech event organizers in Pakistan.',
            website: 'https://novacon.pk',
            members: {
                create: [
                    { userId: owner.id, role: OrgRole.OWNER },
                    { userId: staffUser.id, role: OrgRole.STAFF }
                ]
            }
        }
    })
    console.log('✅ Organization created:', org.name)

    // ─── 3. Event ─────────────────────────────────────────────────────────────
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 1) // Started yesterday
    const endDate = new Date(today)
    endDate.setDate(today.getDate() + 1) // Ends tomorrow

    const event = await prisma.event.create({
        data: {
            orgId: org.id,
            name: 'NovaCon 2026',
            slug: 'novacon-2026',
            eventType: 'Tech Conference',
            status: EventStatus.LIVE,
            startDate,
            endDate,
            venue: 'FAST NUCES, Chiniot-Faisalabad Campus',
            city: 'Faisalabad',
            expectedAttendees: 1500,
            capacity: 1500,
            isPublic: true,
        }
    })
    console.log('✅ Event created:', event.name)

    // Assign users to the event
    const orgOwnerMember = await prisma.orgMember.findUnique({ where: { orgId_userId: { orgId: org.id, userId: owner.id } } })
    const orgStaffMember = await prisma.orgMember.findUnique({ where: { orgId_userId: { orgId: org.id, userId: staffUser.id } } })
    
    if (orgOwnerMember) {
        await prisma.eventMember.create({ data: { eventId: event.id, memberId: orgOwnerMember.id } })
    }
    if (orgStaffMember) {
        await prisma.eventMember.create({ data: { eventId: event.id, memberId: orgStaffMember.id } })
    }

    // ─── 4. Ticket Tiers ──────────────────────────────────────────────────────
    const standardTier = await prisma.ticketTier.create({
        data: { eventId: event.id, name: 'Standard Ticket', code: 'STANDARD', price: 2500, description: 'Access to all main sessions' }
    })
    const premiumTier = await prisma.ticketTier.create({
        data: { eventId: event.id, name: 'Premium Pass', code: 'PREMIUM', price: 5000, description: 'VIP seating and lunch' }
    })
    const workshopTier = await prisma.ticketTier.create({
        data: { eventId: event.id, name: 'Workshop Only', code: 'WORKSHOP', price: 3500, description: 'Access to specialized workshops' }
    })
    console.log('✅ Ticket tiers created')

    // ─── 5. Speakers ──────────────────────────────────────────────────────────
    const speakerData = [
        { name: 'Dr. Sadia Khalid', jobTitle: 'Associate Professor, NUST', track: 'AI & ML', bio: 'Leading researcher in quantum ML with 40+ publications. Previously at MIT CSAIL.', avatar: 'SK' },
        { name: 'Usman Tariq', jobTitle: 'Senior Engineer, Arbisoft', track: 'Web Dev', bio: 'Core contributor to 3 open-source WebAssembly runtimes. 8 years in systems programming.', avatar: 'UT' },
        { name: 'Hira Baig', jobTitle: 'DevOps Lead, Systems Ltd', track: 'DevOps', bio: 'Built CI/CD infrastructure serving 2M+ daily deployments. AWS certified solutions architect.', avatar: 'HB' },
        { name: 'Bilal Chaudhry', jobTitle: 'Co-founder, ChainPK', track: 'Blockchain', bio: "Founded Pakistan's first DeFi protocol. Previously blockchain lead at HBL Digital.", avatar: 'BC' },
        { name: 'Fatima Noor', jobTitle: 'ICPC World Finalist', track: 'CP', bio: 'Ranked #1 in Pakistan on Codeforces. Coached national competitive programming team 2023–24.', avatar: 'FN' },
        { name: 'Ahmed Raza', jobTitle: 'Security Researcher, NCCS', track: 'Cybersecurity', bio: 'Discovered 12 CVEs in major Pakistani banking systems. Bug bounty hunter, OSCP certified.', avatar: 'AR' },
        { name: 'Zara Malik', jobTitle: 'Frontend Architect, Airlift', track: 'Web Dev', bio: 'Scaled React frontend to 1M+ concurrent users. Core team of React Pakistan community.', avatar: 'ZM' },
        { name: 'Dr. Omar Sheikh', jobTitle: 'NLP Research Lead, Replit', track: 'AI & ML', bio: 'PhD from Stanford. Built multilingual LLM fine-tuning pipeline for Urdu and regional languages.', avatar: 'OS' },
        { name: 'Nadia Hussain', jobTitle: 'Partner, Indus Valley Capital', track: 'Entrepreneurship', bio: 'Led Series A investments in 14 Pakistani startups. Former VP at Careem.', avatar: 'NH' },
    ]

    const speakers = []
    for (const s of speakerData) {
        speakers.push(await prisma.speaker.create({
            data: { ...s, eventId: event.id }
        }))
    }
    console.log('✅ Speakers created:', speakers.length)

    // ─── 6. Sessions ──────────────────────────────────────────────────────────
    const sessions = [
        { title: 'The Future of LLMs in Emerging Markets', track: 'AI & ML', venue: 'Main Auditorium', day: 1, time: '09:00', durationMin: 60, capacity: 500, speakerId: speakers[7].id, status: SessionStatus.ENDED },
        { title: 'Zero-Knowledge Proofs on Ethereum', track: 'Blockchain', venue: 'Hall B', day: 1, time: '10:30', durationMin: 45, capacity: 200, speakerId: speakers[3].id, status: SessionStatus.ENDED },
        { title: 'Serverless Architectures at Scale', track: 'DevOps', venue: 'Hall C', day: 1, time: '11:30', durationMin: 45, capacity: 150, speakerId: speakers[2].id, status: SessionStatus.ENDED },
        { title: 'Advanced Graph Algorithms', track: 'CP', venue: 'Lab 1', day: 1, time: '14:00', durationMin: 90, capacity: 60, speakerId: speakers[4].id, status: SessionStatus.ENDED },
        
        { title: 'Building Resilient Micro-Frontends', track: 'Web Dev', venue: 'Hall A', day: 2, time: '09:30', durationMin: 60, capacity: 300, speakerId: speakers[6].id, status: SessionStatus.LIVE },
        { title: 'Quantum Computing and Security', track: 'Cybersecurity', venue: 'Main Auditorium', day: 2, time: '11:00', durationMin: 45, capacity: 500, speakerId: speakers[5].id, status: SessionStatus.UPCOMING },
        { title: 'Applied Machine Learning in Healthcare', track: 'AI & ML', venue: 'Hall B', day: 2, time: '13:30', durationMin: 60, capacity: 200, speakerId: speakers[0].id, status: SessionStatus.UPCOMING },
        { title: 'WebAssembly in 2026', track: 'Web Dev', venue: 'Hall C', day: 2, time: '15:00', durationMin: 45, capacity: 150, speakerId: speakers[1].id, status: SessionStatus.UPCOMING },
        { title: 'Scaling Tech Startups in MENAP', track: 'Entrepreneurship', venue: 'Main Auditorium', day: 3, time: '10:00', durationMin: 60, capacity: 500, speakerId: speakers[8].id, status: SessionStatus.UPCOMING },
    ]

    for (const s of sessions) {
        await prisma.session.create({ data: { ...s, eventId: event.id } })
    }
    console.log('✅ Sessions created:', sessions.length)

    // ─── 7. Registrations ─────────────────────────────────────────────────────
    const names = ['Ali', 'Zainab', 'Omar', 'Fatima', 'Bilal', 'Ayesha', 'Usman', 'Sara', 'Hamza', 'Hira']
    const universities = ['FAST NUCES', 'NUST', 'LUMS', 'PU', 'UET', 'COMSATS', 'IBA']
    const tracks = ['AI & ML', 'Web Dev', 'Cybersecurity', 'Blockchain', 'DevOps', 'CP', 'Entrepreneurship']
    const statuses = [RegistrationStatus.REGISTERED, RegistrationStatus.CHECKED_IN, RegistrationStatus.CANCELLED]

    let checkinCount = 0
    let regCount = 0
    
    // Seed 140 days of history
    for (let dayOffset = 140; dayOffset >= 0; dayOffset--) {
        const baseRegistrations = Math.floor(Math.random() * 5) + 1
        // Spike as event gets closer
        const spikeMultiplier = dayOffset < 14 ? (14 - dayOffset) * 0.8 : 1
        const dailyCount = Math.floor(baseRegistrations * spikeMultiplier)
        
        for (let i = 0; i < dailyCount; i++) {
            regCount++
            const name = `${names[Math.floor(Math.random() * names.length)]} ${Math.floor(Math.random() * 1000)}`
            const isCheckedIn = Math.random() > 0.4
            if (isCheckedIn) checkinCount++
            
            const rDate = new Date(today)
            rDate.setDate(rDate.getDate() - dayOffset)
            
            // Randomly assign ticket tier
            const randTier = Math.random()
            let tier = standardTier
            let tCode = 'STANDARD'
            if (randTier > 0.8) { tier = premiumTier; tCode = 'PREMIUM' }
            else if (randTier > 0.6) { tier = workshopTier; tCode = 'WORKSHOP' }

            await prisma.registration.create({
                data: {
                    eventId: event.id,
                    name,
                    email: `user${regCount}@example.com`,
                    university: universities[Math.floor(Math.random() * universities.length)],
                    track: tracks[Math.floor(Math.random() * tracks.length)],
                    ticketTierId: tier.id,
                    ticketType: tCode, // kept for backward compat
                    status: isCheckedIn ? RegistrationStatus.CHECKED_IN : RegistrationStatus.REGISTERED,
                    registeredAt: rDate
                }
            })
        }
    }
    console.log(`✅ Registrations created: ${regCount} (${checkinCount} checked in)`)

    // ─── 8. Finance Records ───────────────────────────────────────────────────
    await prisma.financeRecord.createMany({
        data: [
            { orgId: org.id, eventId: event.id, type: FinanceType.EXPENSE, category: 'Venue', description: 'Auditorium Booking', budgetedAmount: 200000, actualAmount: 200000, paidAmount: 200000, paymentStatus: PaymentStatus.PAID, createdById: owner.id },
            { orgId: org.id, eventId: event.id, type: FinanceType.EXPENSE, category: 'Catering', description: 'Day 1 Lunch', budgetedAmount: 150000, actualAmount: 165000, paidAmount: 50000, paymentStatus: PaymentStatus.PARTIAL, createdById: owner.id },
            { orgId: org.id, eventId: event.id, type: FinanceType.RECEIVABLE, category: 'Sponsorship', description: 'Gold Sponsor Payment', budgetedAmount: 500000, actualAmount: 500000, paidAmount: 0, paymentStatus: PaymentStatus.PENDING, createdById: owner.id },
        ]
    })
    console.log('✅ Finance records seeded')

    console.log('✨ Seeding complete!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
