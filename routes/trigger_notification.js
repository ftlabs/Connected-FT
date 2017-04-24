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
/* GET home page. */
router.post('/', function(req, res, next) {

  const subscription = req.body;

  console.log(subscription);
  
  webPush.sendNotification(subscription, JSON.stringify({"notification" : {
      "body" : "Server-side body",
      "title" : "Connected FT",
    } } ));

  res.json({
    message : "Got it"
  });

});

module.exports = router;
