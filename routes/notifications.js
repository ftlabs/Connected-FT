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

router.post('/register', (req, res) => {
  
  console.log(req.body);
  const data = req.body;
  devices[data.id] = data.subscription;
  res.end();

})

router.post('/trigger/:DEVICE_ID', (req, res) => {

  const deviceToTarget = req.params.DEVICE_ID;
  const data = req.body;
  webPush.sendNotification(devices[deviceToTarget], JSON.stringify(data) );

  res.end();

});



module.exports = router;
