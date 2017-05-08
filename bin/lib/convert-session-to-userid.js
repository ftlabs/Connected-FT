const debug = require('debug')('bin:lib:convert-session-to-userid');
const membership = require('./membership');

module.exports = function(req, res, next){

	membership.validateSession(req.cookies['FTSession'], false)
		.then(uuid => {
			debug(uuid);
			if(uuid === undefined){
				res.status(401);
				res.json({
					status : 'err',
					message : 'The user is not logged in.'
				});
			} else {
				res.locals.userid = uuid;
				next();
			}
		})
		.catch(err => {
			debug(err);
			res.status(500);
			res.json({
				status : 'err',
				message : 'An error occurred trying to check the users session'
			});
		})
	;

};