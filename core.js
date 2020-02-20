var http = require('http');
var async = require('async');
var WebSocketServer = require('websocket').server;
var WebSocketRouter = require('websocket').router;
function core(){
	var self = this;
    self.isRunning = false;
	self.server = null;
	self.wsServer = null;
	self.wsRouter = null;
	self.path = null;
	
}

core.run = function(methodsIndex, callback){
	var self = this;
	if(self.isRunning){
		return callback("core_is_already_running");
	}
	if(!methodsIndex){
		return callback("missing MethodsIndex");
	}
	if(typeof(methodsIndex.Methods) === 'undefined'){
		return callback("missing MethodsIndex.Methods");
	}
	self.methods = methodsIndex.Methods;
	self.server = http.createServer().listen(3000);
	self.wsServer = new WebSocketServer({
		httpServer: self.server
	});
	self.path = '/bot/1';
	self.wsRouter = new WebSocketRouter();
	self.wsRouter.attachServer(self.wsServer);

	self.wsRouter.mount(self.path, '', function(request) {
		var connection = request.accept(request.origin);

		connection.on('close', function() {
			
		});

		connection.on('message', function(message) {
			if (message.type === 'utf8') {
				self.connection = connection;
				
				var sourceIP = '';
				if(request && request.webSocketRequest && request.webSocketRequest.remoteAddress){
					sourceIP = request.webSocketRequest.remoteAddress;
				}
				self.request =  request;
				self.dispatch(message.utf8Data, function(response) {
					connection.send(response);
				});
			}
		});
	});
	self.isRunning = true;
	return callback(null, true);
};
core.dispatch = function( data, dispatchcallback) {
	var self = this;
	async.waterfall([
		function(callback) {
			self.parseJsonData(data, callback);
		}
	], function(err, jsonData) {
		if (err) {
			return dispatchcallback(JSON.stringify(response));
		} else {
			self.route(jsonData, function(response){
				return dispatchcallback(JSON.stringify(response));
			});
		}
	});
};
core.parseJsonData = function(data, callback) {
	var jsonData;

	try {
		jsonData = JSON.parse(data) || {};
		if(typeof jsonData !== 'object'){
			return callback('request_is_not_a_json_obj');
		}
	} catch (e) {
		return callback('json_parse_error');
	}

	return callback(null, jsonData);
};
core.route = function (data, callback) {
	var self = this;
	var method = data.method;
	api_handler = self.methods[method];
	api_handler[1].handle(data, self.connection ? self.connection : null, function (err, res) {
	if (err) {
			return callback(res);
		} else {
			return callback(res);
		}
	}, self.request);


};
module.exports=core;