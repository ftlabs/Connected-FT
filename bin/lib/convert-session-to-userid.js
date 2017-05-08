const debug = require('debug')('bin:lib:convert-session-to-userid');
const membership = require('./membership');

module.exports = function(req, res, next){

	membership.validateSession(req.cookies['FTSession'], false)
		.then(uuid => {
			debug(uuid);
			if(uuid === undefined){
				throw 'There is no uuid in the response from the membership API';
			}
			res.locals.userid = uuid;
			next();
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