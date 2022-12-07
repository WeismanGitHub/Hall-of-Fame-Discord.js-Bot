const rateLimit = require('express-rate-limit')
const errorHandler = require('./error-handler')
const { NotFoundError } = require('./errors')
const cookieParser = require('cookie-parser')
const compression = require('compression')
const apiRouter = require('./api-router')
const express = require('express')
const helmet = require('helmet')
require('express-async-errors')
const path = require('path')
const cors = require('cors')

const app = express();
const limiter = rateLimit({
    windowMs: 500,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
})

app.use(limiter)
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.resolve(__dirname, './build')))
app.use(cookieParser())
app.use(express.json())
app.use(compression())
app.use(helmet())
app.use(cors({
    origin: ['http://localhost:5000'],
}))

app.use('/api/v1', apiRouter)

app.use('/api/v1', (req, res, next) => {
	throw new NotFoundError('Route does not exist.')
})

app.use(errorHandler)

module.exports = app