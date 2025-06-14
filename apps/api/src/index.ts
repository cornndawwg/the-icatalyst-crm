import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// Import routes
import { authRoutes } from './routes/auth'
import { partnerRoutes } from './routes/partners'
import { customerRoutes } from './routes/customers'
import { proposalRoutes } from './routes/proposals'
import { emailRoutes } from './routes/email'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Trust proxy for Railway deployment
app.set('trust proxy', 1)

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://web-icatalyst.up.railway.app', process.env.APP_URL!].filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Body parsing middleware
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/partners', partnerRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/proposals', proposalRoutes)
app.use('/api/email', emailRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  })
})

app.listen(PORT, () => {
  console.log(`🚀 iCatalyst CRM API running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})