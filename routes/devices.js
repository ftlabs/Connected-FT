const debug = require('debug')('routes:devices');
const express = require('express');
const router = express.Router();

const devices = require('../bin/lib/devices');
const convertSessionToUserID = require('../bin/lib/convert-session-to-userid');

router.use(convertSessionToUserID);

router.get('/list', (req, res) => {

	debug(res.locals.userid);
	devices.list(res.locals.userid)
		.then(devices => {
			debug(devices);

			devices = devices.map(entry => {

				return {
					name : entry.name,
					deviceid : entry.deviceid
				};

			});

			res.json({
				devices
			});
		})
		.catch(err => {
			debug(err);
		})
	;

});

router.post('/register', (req, res) => {

	const details = req.body;
	details.userid = res.locals.userid;

	debug(req.body);

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

module.exports = router;