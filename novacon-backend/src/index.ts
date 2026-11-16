import express from 'express'
import cors from 'cors'
import statsRouter from './routes/stats'
import sessionsRouter from './routes/sessions'
import speakersRouter from './routes/speakers'
import registrationsRouter from './routes/registrations'
import analyticsRouter from './routes/analytics'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/stats', statsRouter)
app.use('/api/sessions', sessionsRouter)
app.use('/api/speakers', speakersRouter)
app.use('/api/registrations', registrationsRouter)
app.use('/api/analytics', analyticsRouter)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`NovaCon API running on http://localhost:${PORT}`)
})

export default app