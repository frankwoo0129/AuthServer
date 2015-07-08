/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var http = require('http');
var querystring = require('querystring');
var parser = require('xml-parser');
var options = {
	hostname: '172.18.32.151',
	port: 80,
	path: '/webservice/sso/Authorization.asmx/IsAuthenticated',
	method: 'POST'
};

var authenticate = function (username, password, callback) {
	var req,
		postData = querystring.stringify({
			DomainName: 'Domain1',
			Login: username,
			Password: password
		});
	
	options.headers = {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': postData.length
	};
	
	req = http.request(options, function (res) {
		if (res.statusCode !== 200) {
			callback({
				message: 'custom auth server error',
				status: 500
			});
		} else {
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				var ret = parser(chunk);
				if (!ret.root) {
					console.log(chunk);
					callback({
						message: 'custom auth server error',
						status: 500
					});
				} else if (ret.root.content === username) {
					callback(null, true);
				} else {
					console.log(chunk);
					callback(null, false);
				}
			});
		}
	});

	req.on('error', function (e) {
		callback(e);
	});
	
	req.write(postData);
	req.end();
};

module.exports.authenticate = authenticate;
