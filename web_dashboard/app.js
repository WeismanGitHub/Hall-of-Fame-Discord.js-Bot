const rateLimit = require('express-rate-limit')
const errorHandler = require('./error-handler')
const compression = require('compression')
const apiRouter = require('./api')
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
app.use(express.json())
app.use(compression())
app.use(helmet())
app.use(cors())

app.use('/api', apiRouter)

app.get('/*', (req, res) => {
	res.status(200).sendFile('index.html', { root: path.join(__dirname, './build') })
});

app.use(errorHandler)

module.exports = app