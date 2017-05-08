const debug = require('debug')('bin:lib:devices');
const uuid = require('uuid').v4;

const database = require('./database');
const filterObject = require('./filter-object');


function createANewDevice(details){

	details = filterObject(details, ['name', 'subscription', 'userid']);
	details.deviceid = uuid();

	return database.write(details, process.env.DEVICE_TABLE)
		.then(function(){
			return details;
		})
		.catch(err => {
			debug(err);
			return 'An error occurred adding this device to our database';
		})
	;

}

function updateDeviceDetails(deviceID, details){

}

function getAllDevicesForUser(userID){

	database.query({
			KeyConditionExpression: '#userid = :userid',
			ExpressionAttributeNames:{
				'#userid': 'userid'
			},
			ExpressionAttributeValues: {
				':userid' : userID
			}
		}, process.env.DEVICE_TABLE)
		.then(data => {
			return data.Items;
		})
		.catch(err => {
			debug(err);
			throw `An error occurred as we tried to get the devices for user ${userID}`;
		})
	;

}

function getDetailsForSpecificDeviceForUser(userID, deviceID){

	database.query({
			KeyConditionExpression: '#userid = :userid and #deviceid = :deviceid',
			ExpressionAttributeNames:{
				'#userid': 'userid',
				'#deviceid' : 'deviceid'
			},
			ExpressionAttributeValues: {
				':userid' : userID,
				':deviceid' : deviceID
			}
		}, process.env.DEVICE_TABLE)
		.then(data => {
			return data.Items;
		})
		.catch(err => {
			debug(err);
			throw `An error occurred as we tried to get the devices for user ${userID}`;
		})
	;

}

module.exports = {
	create : createANewDevice,
	update : updateDeviceDetails,
	list : getAllDevicesForUser,
	get : getDetailsForSpecificDeviceForUser
};