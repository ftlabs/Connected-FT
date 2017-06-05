const debug = require('debug')('routes:timeline');
const express = require('express');
const router = express.Router();

const timeline = require('../bin/lib/timeline');
const convertSessionToUserID = require('../bin/lib/convert-session-to-userid');

router.use(convertSessionToUserID);

router.get('/me', (req, res) => {

	timeline.get(res.locals.userid)
		.then(userTimeline => {

		})
		.catch(err => {
			debug(err);
			res.status(500);
			res.json({
				status : 'err',
				message : `An error occurred getting the timeline for user ${res.locals.userid}`
			});
		})
	;

	res.end();

});

module.exports = router;
