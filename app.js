(function(){'use strict';}());


var methods = require('./lib/api/index.js');
var core = require('./core.js');

core.run(methods, function(err, res){
	if(err || !res){
		throw new Error("failed to run mcore");
	}else{
		console.log("Application started");
	}
});
