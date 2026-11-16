import express from 'express'
import data from '../data/registrations.json'

const router = express.Router()

router.get('/', (req, res) => {
    let result = [...data]
    const track = req.query.track as string
    const ticket = req.query.ticket as string
    const status = req.query.status as string
    const search = req.query.search as string

    if (track) result = result.filter(r => r.track === track)
    if (ticket) result = result.filter(r => r.ticket === ticket)
    if (status) result = result.filter(r => r.status === status)
    if (search) {
        result = result.filter(r =>
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.university.toLowerCase().includes(search.toLowerCase())
        )
    }

    const page = parseInt(req.query.page as string) || 1
    const limit = 10
    const total = result.length
    const paginated = result.slice((page - 1) * limit, page * limit)

    res.json({ data: paginated, total, page, pages: Math.ceil(total / limit) })
})

export default router