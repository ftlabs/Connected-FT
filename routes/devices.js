const express = require('express');
const router = express.Router();

const devices = require('../bin/lib/devices');

router.get('/list', (req, res) => {
	
	res.end();

});

router.post('/register', (req, res) => {

	res.end();

});

router.get('/details/:UUID', (req, res) => {

	res.end();

});

module.exports = router;