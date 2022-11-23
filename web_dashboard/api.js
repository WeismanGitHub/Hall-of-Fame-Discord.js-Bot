const { Router } = require('express')

const router = Router()

router.get('*', (req, res) => {
	res.status(404).send('Route does not exist.')
});

module.exports = router