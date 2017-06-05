const debug = require('debug')('routes:devices');
const express = require('express');
const router = express.Router();

const devices = require('../bin/lib/devices');
const convertSessionToUserID = require('../bin/lib/convert-session-to-userid');

router.use(convertSessionToUserID);

router.post('/whoami', (req, res) => {

	const subscription = req.body.subscription;

	if(!subscription){
		res.status(422);
		res.json({
			status : 'err',
			message : 'No subscription was passed'
		});
	} else {
		devices.getBySubscription(subscription)
			.then(device => {
				
				if(device){
					res.json({
						deviceid : device.deviceid
					});
				} else {
					res.status(404);
					res.json({
						status : "err",
						message : "A device was not found for that subscription"
					});
				}

			})
			.catch(err => {
				debug(err);
				res.status(500);
				res.json({
					status : 'err',
					message : 'An error occurred trying to figure out which device this is.'
				});
			})
		;
	}

});

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

router.delete('/unregister/:DEVICE_ID([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})', (req, res) => {

	const thisUser = res.locals.userid;
	const requestedDevice = req.params['DEVICE_ID'];

	devices.get(requestedDevice)
		.then(device => {
			debug(device);
			if(device.userid === thisUser){
				// Delete the device entry
				devices.delete(requestedDevice)
					.then(result => {
						debug(result);
						res.json({
							status : 'ok',
							message : `Device ${requestedDevice} has been sucessfully unregistered`
						})
					})
					.catch(err => {
						debug(err);
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

});

module.exports = router;