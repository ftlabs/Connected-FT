const debug = require('debug')('routes:notifications');
const express = require('express');
const router = express.Router();

const webPush = require('web-push');
webPush.setGCMAPIKey(process.env.GCM_API_KEY);

// VAPID keys should only be generated only once. 
const vapidKeys = webPush.generateVAPIDKeys();
 
webPush.setVapidDetails(
  'mailto:enquiries@labs.ft.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const devices = {};

router.post('/trigger/:DEVICE_ID', (req, res) => {

  const deviceToTarget = req.params.DEVICE_ID;
  const data = req.body;

  debug(devices[deviceToTarget]);

  webPush.sendNotification(devices[deviceToTarget], JSON.stringify(data) );

  res.end();

});



module.exports = router;
