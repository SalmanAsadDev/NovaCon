import { PrismaClient, Role, TicketType, RegistrationStatus, SessionStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding NovaCon database...')

    // ─── Users ───────────────────────────────────────────────────────────────
    const adminPassword = await bcrypt.hash('Admin@1234', 12)
    const viewerPassword = await bcrypt.hash('Viewer@1234', 12)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@novacon.pk' },
        update: {},
        create: {
            email: 'admin@novacon.pk',
            name: 'Admin User',
            password: adminPassword,
            role: Role.ADMIN,
        },
    })

    const viewer = await prisma.user.upsert({
        where: { email: 'viewer@novacon.pk' },
        update: {},
        create: {
            email: 'viewer@novacon.pk',
            name: 'Viewer User',
            password: viewerPassword,
            role: Role.VIEWER,
        },
    })

    console.log('✅ Users created:', admin.email, viewer.email)

    // ─── Speakers ────────────────────────────────────────────────────────────
    const speakerData = [
        { id: 'sp1', name: 'Dr. Sadia Khalid', jobTitle: 'Associate Professor, NUST', track: 'AI & ML', bio: 'Leading researcher in quantum ML with 40+ publications. Previously at MIT CSAIL.', avatar: 'SK' },
        { id: 'sp2', name: 'Usman Tariq', jobTitle: 'Senior Engineer, Arbisoft', track: 'Web Dev', bio: 'Core contributor to 3 open-source WebAssembly runtimes. 8 years in systems programming.', avatar: 'UT' },
        { id: 'sp3', name: 'Hira Baig', jobTitle: 'DevOps Lead, Systems Ltd', track: 'DevOps', bio: 'Built CI/CD infrastructure serving 2M+ daily deployments. AWS certified solutions architect.', avatar: 'HB' },
        { id: 'sp4', name: 'Bilal Chaudhry', jobTitle: 'Co-founder, ChainPK', track: 'Blockchain', bio: "Founded Pakistan's first DeFi protocol. Previously blockchain lead at HBL Digital.", avatar: 'BC' },
        { id: 'sp5', name: 'Fatima Noor', jobTitle: 'ICPC World Finalist', track: 'CP', bio: 'Ranked #1 in Pakistan on Codeforces. Coached national competitive programming team 2023–24.', avatar: 'FN' },
        { id: 'sp6', name: 'Ahmed Raza', jobTitle: 'Security Researcher, NCCS', track: 'Cybersecurity', bio: 'Discovered 12 CVEs in major Pakistani banking systems. Bug bounty hunter, OSCP certified.', avatar: 'AR' },
        { id: 'sp7', name: 'Zara Malik', jobTitle: 'Frontend Architect, Airlift', track: 'Web Dev', bio: 'Scaled React frontend to 1M+ concurrent users. Core team of React Pakistan community.', avatar: 'ZM' },
        { id: 'sp8', name: 'Dr. Omar Sheikh', jobTitle: 'NLP Research Lead, Replit', track: 'AI & ML', bio: 'PhD from Stanford. Built multilingual LLM fine-tuning pipeline for Urdu and regional languages.', avatar: 'OS' },
        { id: 'sp9', name: 'Nadia Hussain', jobTitle: 'Partner, Indus Valley Capital', track: 'Entrepreneurship', bio: 'Led Series A investments in 14 Pakistani startups. Former VP at Careem.', avatar: 'NH' },
    ]

    const speakers: Record<string, string> = {}
    for (const s of speakerData) {
        const sp = await prisma.speaker.upsert({
            where: { id: s.id },
            update: {},
            create: s,
        })
        speakers[s.id] = sp.id
    }
    console.log('✅ Speakers created:', Object.keys(speakers).length)

    // ─── Sessions ─────────────────────────────────────────────────────────────
    const sessionData = [
        { id: 's1', title: 'Keynote: The Future of AI in Pakistan', track: 'AI & ML', venue: 'Main Auditorium', day: 1, time: '09:00', durationMin: 60, capacity: 500, registered: 498, status: SessionStatus.UPCOMING, speakerId: 'sp1' },
        { id: 's2', title: 'WebAssembly in Production', track: 'Web Dev', venue: 'Room 3', day: 1, time: '11:00', durationMin: 45, capacity: 120, registered: 120, status: SessionStatus.FULL, speakerId: 'sp2' },
        { id: 's3', title: 'Cloud Native Architecture at Scale', track: 'DevOps', venue: 'Room 1', day: 1, time: '14:00', durationMin: 45, capacity: 150, registered: 134, status: SessionStatus.LIVE, speakerId: 'sp3' },
        { id: 's4', title: 'Quantum Computing: A Practical Intro', track: 'Emerging Tech', venue: 'Room 2', day: 1, time: '15:30', durationMin: 60, capacity: 200, registered: 187, status: SessionStatus.UPCOMING, speakerId: 'sp1' },
        { id: 's5', title: 'Blockchain Beyond Hype', track: 'Blockchain', venue: 'Room 4', day: 1, time: '16:30', durationMin: 45, capacity: 100, registered: 89, status: SessionStatus.UPCOMING, speakerId: 'sp4' },
        { id: 's6', title: 'Competitive Programming Masterclass', track: 'CP', venue: 'Lab A', day: 2, time: '10:00', durationMin: 90, capacity: 80, registered: 80, status: SessionStatus.FULL, speakerId: 'sp5' },
        { id: 's7', title: 'Cybersecurity Red Team Workshop', track: 'Cybersecurity', venue: 'Lab B', day: 2, time: '11:30', durationMin: 90, capacity: 60, registered: 58, status: SessionStatus.LIVE, speakerId: 'sp6' },
        { id: 's8', title: 'React Server Components Deep Dive', track: 'Web Dev', venue: 'Room 3', day: 2, time: '14:00', durationMin: 60, capacity: 120, registered: 103, status: SessionStatus.LIVE, speakerId: 'sp7' },
        { id: 's9', title: 'LLMs: Fine-tuning & Deployment', track: 'AI & ML', venue: 'Room 2', day: 2, time: '15:00', durationMin: 60, capacity: 200, registered: 196, status: SessionStatus.LIVE, speakerId: 'sp8' },
        { id: 's10', title: 'Startup Pitching: From Idea to VC', track: 'Entrepreneurship', venue: 'Room 1', day: 3, time: '10:00', durationMin: 60, capacity: 150, registered: 121, status: SessionStatus.UPCOMING, speakerId: 'sp9' },
        { id: 's11', title: 'DevOps with GitHub Actions', track: 'DevOps', venue: 'Lab A', day: 3, time: '11:00', durationMin: 45, capacity: 80, registered: 74, status: SessionStatus.UPCOMING, speakerId: 'sp3' },
        { id: 's12', title: 'Closing Ceremony & Awards', track: 'General', venue: 'Main Auditorium', day: 3, time: '16:00', durationMin: 60, capacity: 500, registered: 340, status: SessionStatus.UPCOMING, speakerId: null },
    ]

    for (const s of sessionData) {
        await prisma.session.upsert({
            where: { id: s.id },
            update: {},
            create: s,
        })
    }
    console.log('✅ Sessions created:', sessionData.length)

    // ─── Registrations ────────────────────────────────────────────────────────
    const regData = [
        { id: 'r001', name: 'Ayesha Raza', email: 'ayesha.raza@nust.edu.pk', university: 'NUST', track: 'AI & ML', ticketType: TicketType.PREMIUM, status: RegistrationStatus.CHECKED_IN },
        { id: 'r002', name: 'Hassan Mirza', email: 'hassan.m@lums.edu.pk', university: 'LUMS', track: 'Web Dev', ticketType: TicketType.STANDARD, status: RegistrationStatus.CHECKED_IN },
        { id: 'r003', name: 'Ibrahim Khan', email: 'ibrahim.k@nu.edu.pk', university: 'FAST Lahore', track: 'Cybersecurity', ticketType: TicketType.STANDARD, status: RegistrationStatus.REGISTERED },
        { id: 'r004', name: 'Zara Niazi', email: 'zara.n@comsats.edu.pk', university: 'COMSATS', track: 'AI & ML', ticketType: TicketType.PREMIUM, status: RegistrationStatus.CHECKED_IN },
        { id: 'r005', name: 'Ahmed Farooq', email: 'ahmed.f@iba.edu.pk', university: 'IBA Karachi', track: 'Blockchain', ticketType: TicketType.STANDARD, status: RegistrationStatus.REGISTERED },
        { id: 'r006', name: 'Maryam Siddiqui', email: 'maryam.s@giki.edu.pk', university: 'GIKI', track: 'CP', ticketType: TicketType.WORKSHOP, status: RegistrationStatus.CHECKED_IN },
        { id: 'r007', name: 'Bilal Ahmed', email: 'bilal.a@uet.edu.pk', university: 'UET Lahore', track: 'DevOps', ticketType: TicketType.STANDARD, status: RegistrationStatus.CHECKED_IN },
        { id: 'r008', name: 'Sana Yousuf', email: 'sana.y@nu.edu.pk', university: 'FAST Islamabad', track: 'Web Dev', ticketType: TicketType.PREMIUM, status: RegistrationStatus.CHECKED_IN },
        { id: 'r009', name: 'Omar Khalid', email: 'omar.k@nust.edu.pk', university: 'NUST', track: 'Emerging Tech', ticketType: TicketType.STANDARD, status: RegistrationStatus.REGISTERED },
        { id: 'r010', name: 'Fatima Sheikh', email: 'fatima.s@lums.edu.pk', university: 'LUMS', track: 'Entrepreneurship', ticketType: TicketType.PREMIUM, status: RegistrationStatus.CHECKED_IN },
        { id: 'r011', name: 'Ali Hassan', email: 'ali.h@itu.edu.pk', university: 'ITU', track: 'AI & ML', ticketType: TicketType.STANDARD, status: RegistrationStatus.REGISTERED },
        { id: 'r012', name: 'Hina Butt', email: 'hina.b@nu.edu.pk', university: 'FAST Karachi', track: 'Cybersecurity', ticketType: TicketType.WORKSHOP, status: RegistrationStatus.CHECKED_IN },
        { id: 'r013', name: 'Saad Iqbal', email: 'saad.i@ucp.edu.pk', university: 'UCP', track: 'Blockchain', ticketType: TicketType.STANDARD, status: RegistrationStatus.REGISTERED },
        { id: 'r014', name: 'Nimra Javed', email: 'nimra.j@comsats.edu.pk', university: 'COMSATS', track: 'Web Dev', ticketType: TicketType.STANDARD, status: RegistrationStatus.CHECKED_IN },
        { id: 'r015', name: 'Faisal Mahmood', email: 'faisal.m@giki.edu.pk', university: 'GIKI', track: 'DevOps', ticketType: TicketType.PREMIUM, status: RegistrationStatus.CHECKED_IN },
        { id: 'r016', name: 'Amna Riaz', email: 'amna.r@qau.edu.pk', university: 'QAU', track: 'CP', ticketType: TicketType.WORKSHOP, status: RegistrationStatus.REGISTERED },
        { id: 'r017', name: 'Tariq Mehmood', email: 'tariq.m@nust.edu.pk', university: 'NUST', track: 'AI & ML', ticketType: TicketType.PREMIUM, status: RegistrationStatus.CHECKED_IN },
        { id: 'r018', name: 'Lubna Awan', email: 'lubna.a@nu.edu.pk', university: 'FAST Islamabad', track: 'Entrepreneurship', ticketType: TicketType.STANDARD, status: RegistrationStatus.CHECKED_IN },
        { id: 'r019', name: 'Waqar Ali', email: 'waqar.a@uet.edu.pk', university: 'UET Peshawar', track: 'Cybersecurity', ticketType: TicketType.STANDARD, status: RegistrationStatus.REGISTERED },
        { id: 'r020', name: 'Khadija Malik', email: 'khadija.m@iba.edu.pk', university: 'IBA Karachi', track: 'Web Dev', ticketType: TicketType.PREMIUM, status: RegistrationStatus.CHECKED_IN },
    ]

    for (const r of regData) {
        await prisma.registration.upsert({
            where: { id: r.id },
            update: {},
            create: r,
        })
    }
    console.log('✅ Registrations created:', regData.length)

    // ─── Registration day stats ───────────────────────────────────────────────
    const dayStats = [
        { date: 'Oct 1', count: 42 },
        { date: 'Oct 2', count: 58 },
        { date: 'Oct 3', count: 71 },
        { date: 'Oct 4', count: 95 },
        { date: 'Oct 5', count: 88 },
        { date: 'Oct 6', count: 120 },
        { date: 'Oct 7', count: 143 },
        { date: 'Oct 8', count: 167 },
        { date: 'Oct 9', count: 198 },
        { date: 'Oct 10', count: 231 },
        { date: 'Oct 11', count: 71 },
    ]

    await prisma.registrationDayStat.deleteMany()
    await prisma.registrationDayStat.createMany({ data: dayStats })
    console.log('✅ Day stats created:', dayStats.length)

    console.log('🎉 Seeding complete!')
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
