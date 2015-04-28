/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var path = require('path');
var fs = require('fs');
var express = require('express');
var hbs = require('hbs');
var marked = require('marked');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var app = express();
var route = require('./route');

//app.set('env', 'production');
app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.use(cookieParser());
//app.use(cookieSession({
//	name: 'SSID',
//	secret: 'CNSBG_AUTHSERVER_20150303',
//	signed: false
//}));
app.use(bodyParser.json());
app.use(function (err, req, res, next) {
	console.log(err.stack);
	res.status(404).json({
		message: err.message
	});
});
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(route);

app.get('/', function (req, res) {
	res.render('demo');
});

app.get('/api', function (req, res) {
	var path = __dirname + '/views/API_BY_Frank.md';
	fs.readFile(path, 'utf8', function (err, data) {
		if (err) {
			res.sendStatus(404);
		} else {
			res.render('markdown', {body: marked(data.toString())});
		}
	});
});

//var test1 = function (req, res, next) {
//	console.log('test1');
//	next();
//};
//
//var test2 = function (req, res, next) {
//	console.log('test2');
//	next();
//};
//
//var test3 = function (req, res, next) {
//	console.log('test3');
//	next();
//};
//
//app.get('/test1', [test1, test2, test3], function (req, res, next) {
//	res.end('OK');
//});

app.get('/test', function (req, res, next) {
	console.log(req.headers);
	var header = req.headers.authorization || '',			// get the header
		token = header.split(/\s+/).pop() || '',			// and the encoded auth token
		auth = new Buffer(token, 'base64').toString(),		// convert from base64
		parts = auth.split(/:/),							// split on colon
		username = parts[0],
		password = parts[1];
	console.log(header);
	console.log(token);
	console.log(auth);
	console.log(parts);
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('username is "' + username + '" and password is "' + password + '"');
});

app.use(express.static(path.join(__dirname, './dist')));

app.use(function (err, req, res, next) {
	console.log(err.stack);
	res.status(500).json({
		message: 'Server Error'
	});
});

app.use(function (req, res) {
	res.status(404).json({
		message: 'Not Found'
	});
});

app.listen(8008, function () {
	var server = this;
	process.on('SIGINT', function () {
		console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
		server.close();
		process.exit();
	});
});


