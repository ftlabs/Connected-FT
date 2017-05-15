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

	devices.get(req.params.UUID, res.locals.userid)
		.then(device => {
			
			if(device === undefined){
				res.status(404);
				res.json({
					status : 'err',
					message : 'Unable to find details for that device ID'
				});
			} else {
				res.json(device);
			}

		})
	;

});

module.exports = router;