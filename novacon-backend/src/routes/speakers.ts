import express from 'express'
import data from '../data/speakers.json'

const router = express.Router()

router.get('/', (req, res) => {
    let result = [...data]
    if (req.query.track) result = result.filter(s => s.track === req.query.track)
    res.json(result)
})

router.get('/:id', (req, res) => {
    const speaker = data.find(s => s.id === req.params.id)
    if (speaker) {
        res.json(speaker)
    } else {
        res.status(404).json({ error: 'Not found' })
    }
})

export default router