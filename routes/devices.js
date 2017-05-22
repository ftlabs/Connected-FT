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
					deviceid : entry.deviceid,
					type : entry.type
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

router.post('/unregister/:DEVICE_ID([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})', (req, res) => {

	// Get device details
	// Check user own it
	// If so, delete entry from database,
	// Otherwise, error out.

	const thisUser = res.locals.userid;
	const requestedDevice = req.params['DEVICE_ID'];

	devices.get(requestedDevice)
		.then(device => {

			if(device.userid === thisUser){
				// Delete the device entry
				devices.delete(requestedDevice)
					.then(result => {
						res.json({
							status : 'ok',
							message : `Device ${requestedDevice} has been sucessfully unregistered`
						})
					})
					.catch(err => {
						res.status(500);
						res.json({
							status : 'err',
							message : `An error occurred unregistering device ${requestedDevice}`
						});
					})
				;
			} else {
				res.status(401);
				res.json({
					status : 'err',
					message : 'You do not own this device. You cannot unregister it from this FT account'
				});
			}

		})
	;

	res.end();

});

module.exports = router;