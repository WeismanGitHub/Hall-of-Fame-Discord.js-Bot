const { ForbiddenError } = require('../errors')
const rateLimit = require('express-rate-limit')
const errorHandler = require('./error-handler')
const { NotFoundError } = require('./errors')
const cookieParser = require('cookie-parser')
const compression = require('compression')
const apiRouter = require('./api-router')
const jwt = require('jsonwebtoken')
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

app.use(helmet({
	contentSecurityPolicy: {
		directives: {
			...helmet.contentSecurityPolicy.getDefaultDirectives(),
			"img-src": ["*"],
			'media-src': ['*']
		},
	},
	crossOriginEmbedderPolicy: false
}))
app.use(limiter)
app.use(compression())
app.use(cors({ origin: ['http://localhost:5000'] }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.json())

app.use('/api/v1/:guildId/*', (req, res, next) => {
	req.guilds = jwt.verify(req.cookies.guilds, process.env.JWT_SECRET)

	if (!req.guilds.includes(req.params.guildId)) {
		throw new ForbiddenError('Invalid Guild Id')
	}

	next()
})

app.use('/api/v1', apiRouter)
app.use(express.static(path.resolve(__dirname, './build')))

app.use('/api/*', (req, res, next) => {
	throw new NotFoundError('Route does not exist.')
})

app.get('/*', (req, res) => {
	res.status(200).sendFile(path.resolve(__dirname, './build/index.html'))
})

app.use(errorHandler)

module.exports = app