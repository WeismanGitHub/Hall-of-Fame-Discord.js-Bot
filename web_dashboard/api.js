const { Router } = require('express')

const router = Router()

router.get('/redirect', (req, res) => {
	res.status(200).redirect(process.env.REDIRECT_LINK)
});

module.exports = router