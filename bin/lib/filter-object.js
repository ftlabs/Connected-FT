module.exports = function(o, validKeys){

	const filteredObj = Object.assign({}, o);

	Object.keys(filteredObj).forEach(key => {

		if(validKeys.indexOf(key) < 0){
			delete filteredObj[key];
		}

	});

	return filteredObj;

};