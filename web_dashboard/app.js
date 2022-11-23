const rateLimit = require('express-rate-limit')
const compression = require('compression')
const mongoose = require('mongoose')
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

app.use('/api/', apiRouter)
app.get('/redirect', (req, res) => {
	res.status(302).redirect(process.env.REDIRECT_LINK)
});

app.get('*', (req, res) => res.sendFile('index.html', { root: path.join(__dirname, './build') }))

module.exports = app