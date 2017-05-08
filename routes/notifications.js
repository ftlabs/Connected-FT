const debug = require('debug')('routes:notifications');
const express = require('express');
const router = express.Router();

const devices = require('../bin/lib/devices');

const webPush = require('web-push');
webPush.setGCMAPIKey(process.env.GCM_API_KEY);

// VAPID keys should only be generated only once. 
const vapidKeys = webPush.generateVAPIDKeys();
 
webPush.setVapidDetails(
	'mailto:enquiries@labs.ft.com',
	vapidKeys.publicKey,
	vapidKeys.privateKey
);

router.post('/trigger/:DEVICE_ID', (req, res) => {

	const data = req.body;
	const device = req.params['DEVICE_ID']

	debug(data, device);

	devices.get(device)
		.then(deviceDetails => {
			debug(deviceDetails);
			webPush.sendNotification(deviceDetails.subscription, JSON.stringify(data) );
			res.json({
				status : 'ok',
				message : `Notification triggered for ${device}`
			})
		})
		.catch(err => {
			debug(err);
			res.status(err.status || 500);
			res.json({
				status : 'err',
				message : 'An error occurred triggering the push notification'
			});
		})
	;

});



module.exports = router;
