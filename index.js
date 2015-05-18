/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var path = require('path');
var fs = require('fs');
var express = require('express');
var basicAuth = require('basic-auth');
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

app.get('/example', function (req, res) {
	var path = __dirname + '/views/example.md';
	fs.readFile(path, 'utf8', function (err, data) {
		if (err) {
			res.sendStatus(404);
		} else {
			res.render('markdown', {body: marked(data.toString())});
		}
	});
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

app.get('/test', function (req, res, next) {
//	var header = req.headers.authorization || '',			// get the header
//		token = header.split(/\s+/).pop() || '',			// and the encoded auth token
//		auth = new Buffer(token, 'base64').toString(),		// convert from base64
//		parts = auth.split(/:/),							// split on colon
//		username = parts[0],
//		password = parts[1];
	var user = basicAuth(req);
	if (!user) {
		return next({
			debug: 'no authorization header',
			message: 'invalid_request',
			status: 400
		});
	}
	res.json(user);
});

app.use(express.static(path.join(__dirname, './dist')));

app.use(function (req, res, next) {
	next({
		message: 'invalid_url',
		status: 404
	});
});

app.use(function (err, req, res, next) {
	if (err.status) {
		res.status(err.status).json({
			message: err.message,
			debug: err.debug
		});
	} else {
		console.log(err);
		console.log(err.stack);
		res.status(500).json({
			debug: err.message,
			message: 'server Error'
		});
	}
});

app.listen(8008, function () {
	var server = this;
	process.on('SIGINT', function () {
		console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
		server.close();
		process.exit();
	});
});


