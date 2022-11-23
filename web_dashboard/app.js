const express = require('express');
require('dotenv').config();

const app = express();

app.get('/', (req, res) => {
	return res.sendFile('index.html', { root: '.' });
});

app.get('/auth', (req, res) => {
	return res.sendFile('index.html', { root: '.' });
});

app.get('/auth/redirect', (req, res) => {
	res.status(200).redirect(process.env.REDIRECT_LINK)
});

module.exports = app