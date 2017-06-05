const debug = require('debug')('bin:lib:devices');
const uuid = require('uuid').v4;

const database = require('./database');
const filterObject = require('./filter-object');

function createANewDevice(details){

	details = filterObject(details, ['name', 'subscription', 'userid', 'type']);
	details.deviceid = uuid();

	debug(details);

	return getAllDevicesForUser(details.userid)
		.then(devices => {

			const existingDevice = devices.filter(device => {
				debug(`${device.type} === ${details.type}`);
				return device.type === details.type;
			})[0];

			if(existingDevice !== undefined){
				details.deviceid = existingDevice.deviceid;
			}

			return database.write(details, process.env.DEVICE_TABLE)
				.then(function(){
					return details;
				})
				.catch(err => {
					debug(err);
					return 'An error occurred adding this device to our database';
				})
			;

		})
	;


}

function getAllDevicesForUser(userID){

	return database.scan({
			FilterExpression : '#userid = :userid',			
			ExpressionAttributeNames:{
				'#userid': 'userid'
			},
			ExpressionAttributeValues: {
				':userid' : userID
			},
			TableName : process.env.DEVICE_TABLE
		})
		.then(data => {
			return data.Items;
		})
		.catch(err => {
			debug(err);
			throw `An error occurred as we tried to get the devices for user ${userID}`;
		})
	;

}

function getDetailsForSpecificDevice(deviceID){

	return database.read({ deviceid : deviceID }, process.env.DEVICE_TABLE)
		.then(data => {
			debug(data);
			return data.Item;
		})
		.catch(err => {
			debug(err);
			throw `An error occurred as we tried to get the device ${deviceID}`;
		})
	;

}

function deleteDeviceFromTables(deviceID){

	return database.delete({deviceid : deviceID}, process.env.DEVICE_TABLE)
		.then(data => {
			debug(data);
			return data;
		})
		.catch(err => {
			debug(err);
			throw `An error occurred deleting device '${deviceID}' from the devices table`;
		})
	;

}

function getDetailsForSpecificDeviceBySubscription(subscription){
	return database.scan({
			FilterExpression : '#subscription = :subscription',			
			ExpressionAttributeNames:{
				'#subscription': 'subscription'
			},
			ExpressionAttributeValues: {
				':subscription' : subscription
			},
			TableName : process.env.DEVICE_TABLE
		})
		.then(data => {
			return data.Items[0];
		})
		.catch(err => {
			debug(err);
			throw `An error occurred as we tried to get a device by subscription`;
		})
	;
}

module.exports = {
	create : createANewDevice,
	list : getAllDevicesForUser,
	get : getDetailsForSpecificDevice,
	delete : deleteDeviceFromTables,
	getBySubscription : getDetailsForSpecificDeviceBySubscription
};