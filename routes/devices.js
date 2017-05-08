const debug = require('debug')('routes:devices');
const express = require('express');
const router = express.Router();

const devices = require('../bin/lib/devices');
const convertSessionToUserID = require('../bin/lib/convert-session-to-userid');

router.use(convertSessionToUserID);

router.get('/list', (req, res) => {

	debug(res.locals.userid);
	devices.list(res.locals.userid);
	res.end();

});

router.post('/register', (req, res) => {

	const details = req.body;
	details.userid = res.locals.userid;

	devices.create(details)
		.then(storedDetails => {
			res.json({
				status : 'ok',
				deviceid : storedDetails.deviceid
			});
		})
		.catch(err => {
			debug(err);
			res.status(500);
			res.json({
				status : 'error',
				message : 'An error occurred registering this device with the service'
			});
		})
	;


});

router.get('/details/:UUID', (req, res) => {

	res.end();

});

module.exports = router;