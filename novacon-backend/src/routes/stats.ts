import express from 'express'
import stats from '../data/stats.json'

const router = express.Router()

router.get('/', (_req, res) => {
    res.json(stats)
})

export default router