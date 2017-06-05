const debug = require('debug')('routes:timeline');
const express = require('express');
const router = express.Router();

const filterObject = require('../bin/lib/filter-object');
const timeline = require('../bin/lib/timeline');
const convertSessionToUserID = require('../bin/lib/convert-session-to-userid');

router.use(convertSessionToUserID);

router.get('/me', (req, res) => {

	timeline.get(res.locals.userid)
		.then(userTimeline => {

			userTimeline = userTimeline
				.map(item => filterObject(item, ['uuid', 'byline', 'headline', 'imagesrc', 'url', 'senttime']))
				.sort( (a, b) => {
					return a.sorttime > b.sorttime ? 1 : -1;
				})
			;
			res.json({
				item : userTimeline
			});

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

});

module.exports = router;
