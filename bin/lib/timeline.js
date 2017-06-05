const debug = require('debug')('bin:lib:timeline');
const uuid = require('uuid').v4;

const database = require('./database');
const filterObject = require('./filter-object');

function getTimelineForUserByID(userID){
	
	return database.scan({
			FilterExpression : '#userid = :userid',			
			ExpressionAttributeNames:{
				'#userid': 'userid'
			},
			ExpressionAttributeValues: {
				':userid' : userID
			},
			TableName : process.env.TIMELINE_TABLE
		})
		.then(data => {
			return data.Items;
		})
		.catch(err => {
			debug(err);
			throw `An error occurred as we tried to get the timeline for user ${userID}`;
		})
	;

}

function addItemToTimelineForUser(item, userID){

	item = filterObject(item, ['headline', 'byline', 'imagesrc', 'url']);
	item.uuid = uuid();
	item.userid = userID;
	item.senttime = new Date() / 1000 | 0;

	return database.write(item, process.env.TIMELINE_TABLE)
		.then(details => {
			return details
		})
		.catch(err => {
			debug(err);
			return 'An error occurred adding an item to the timeline';
		})
	;

}

module.exports = {
	get : getTimelineForUserByID,
	add : addItemToTimelineForUser
};