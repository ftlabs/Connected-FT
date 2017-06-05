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

	/*{
		"headline" : "Delay to air pollution plan comes under fire",
		"byline" : "Ministers ask courts to extend deadline owing to snap election purdah rules",
		"imagesrc" : "https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fcom.ft.imagepublish.prod.s3.amazonaws.com%2Fe4fbf3c6-28da-11e7-bc4b-5528796fe35c?source=next&fit=scale-down&width=700",
		"url" : "https://www.ft.com/content/f09ced2c-26cb-11e7-8691-d5f7e0cd0a16"
	}*/

	item = filterObject(item, ['headline', 'byline', 'imagesrc', 'url']);
	item.uuid = uuid();
	item.userid = userID;

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