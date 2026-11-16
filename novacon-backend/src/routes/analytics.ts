import express from 'express'
import registrations from '../data/registrations.json'
import stats from '../data/stats.json'

const router = express.Router()

router.get('/', (_req, res) => {
    const byUniversity: Record<string, number> = {}
    const byTrack: Record<string, number> = {}
    const byTicket: Record<string, number> = {}

    registrations.forEach(r => {
        byUniversity[r.university] = (byUniversity[r.university] || 0) + 1
        byTrack[r.track] = (byTrack[r.track] || 0) + 1
        byTicket[r.ticket] = (byTicket[r.ticket] || 0) + 1
    })

    res.json({
        byUniversity: Object.entries(byUniversity).map(([name, count]) => ({ name, count })),
        byTrack: Object.entries(byTrack).map(([name, count]) => ({ name, count })),
        byTicket: Object.entries(byTicket).map(([name, count]) => ({ name, count })),
        registrationsByDay: stats.registrationsByDay,
    })
})

export default router