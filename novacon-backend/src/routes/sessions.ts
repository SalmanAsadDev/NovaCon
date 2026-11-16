import express from 'express'
import data from '../data/sessions.json'

const router = express.Router()

router.get('/', (req, res) => {
    let result = [...data]
    if (req.query.track) result = result.filter(s => s.track === req.query.track)
    if (req.query.day) result = result.filter(s => s.day === Number(req.query.day))
    if (req.query.status) result = result.filter(s => s.status === req.query.status)
    res.json(result)
})

router.get('/:id', (req, res) => {
    const session = data.find(s => s.id === req.params.id)
    if (session) {
        res.json(session)
    } else {
        res.status(404).json({ error: 'Not found' })
    }
})

export default router