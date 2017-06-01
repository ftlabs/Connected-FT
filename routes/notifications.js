const debug = require('debug')('routes:notifications');
const express = require('express');
const router = express.Router();

const devices = require('../bin/lib/devices');
const convertSessionToUserID = require('../bin/lib/convert-session-to-userid');

const webPush = require('web-push');
webPush.setGCMAPIKey(process.env.GCM_API_KEY);

// VAPID keys should only be generated only once. 
const vapidKeys = webPush.generateVAPIDKeys();
 
webPush.setVapidDetails(
	'mailto:enquiries@labs.ft.com',
	vapidKeys.publicKey,
	vapidKeys.privateKey
);

function triggerNotification(subscription, payload){
	webPush.sendNotification(subscription, JSON.stringify(payload) );
}

router.post('/trigger/:DEVICE_ID', (req, res) => {

	const data = req.body;
	const device = req.params['DEVICE_ID'];

	debug('TRIGGER', data, device);

	devices.get(device)
		.then(deviceDetails => {
			triggerNotification(deviceDetails.subscription, data);
			debug(deviceDetails);
			res.json({
				status : 'ok',
				message : `Notification triggered for ${device}`
			});
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

router.get('/trigger/type/:DEVICE_TYPE(phone|tablet|computer)', convertSessionToUserID, (req, res) => {

	const data = req.body;
	const requestedType = req.params['DEVICE_TYPE'];

	devices.list(res.locals.userid)
		.then( devices => devices.filter( device => { return device.type === requestedType; } ) )
		.then( deviceOfType => {

			deviceOfType = deviceOfType[0];

			if(deviceOfType === undefined){
				res.status(404);
				res.json({
					status : 'err',
					message : 'A device of this type was not found for this user'
				});	
			} else {
				triggerNotification(deviceOfType.subscription, data);
				res.json({
					status : 'ok',
					message : `Notification triggered for ${requestedType}`
				});
			}

		} )
	;

	res.end();

});

module.exports = router;
