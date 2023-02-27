const { ForbiddenError } = require('../errors')
const rateLimit = require('express-rate-limit')
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

const max = 15
const app = express();
const limiter = rateLimit({
    windowMs: 1000,
	max: max,
	standardHeaders: true,
	legacyHeaders: false,
	message: `Rate Limit: ${max} requests per second`
})

app.use(helmet({
	contentSecurityPolicy: {
		directives: {
			...helmet.contentSecurityPolicy.getDefaultDirectives(),
			"img-src": ["*", "blob:"],
			'media-src': ['*'],
			"default-src": ["'self'", "https://api.imgur.com/3/image/"]
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
	req.guilds = jwt.verify(req.cookies.guilds, process.env.JWT_SECRET).guilds

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

app.use((err, req, res, next) => {
    console.error(err.message)
    res.status(err.statusCode || 500).send(err.message)
})

module.exports = app