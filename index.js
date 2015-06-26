/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var path = require('path');
var fs = require('fs');
var express = require('express');
var hbs = require('hbs');
var marked = require('marked');
var moment = require('moment');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var route = require('./route');

//app.set('env', 'production');
app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

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

app.use('/test', express.static(path.join(__dirname, './apidoc')));

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

app.get('/api/:id', function (req, res) {
	var path = __dirname + '/views/api/' + req.params.id + '.md';
	fs.readFile(path, 'utf8', function (err, data) {
		if (err) {
			res.sendStatus(404);
		} else {
			res.render('markdown', {body: marked(data.toString())});
		}
	});
});

app.use(express.static(path.join(__dirname, './dist')));

app.use(route);

app.use(function (req, res, next) {
	next({
		method: req.method,
		url: req.originalUrl,
		message: 'no this url',
		status: 404
	});
});

app.use(function (err, req, res, next) {
	console.log('Url: ' + req.originalUrl);
	console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
	console.log(err);
	if (err.status) {
		res.status(err.status).json({
			message: err.message,
			debug: err.debug
		});
	} else {
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


