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
var morgan = require('morgan');
var app = express();
var route = require('./route');
var oauth2 = require('./lib/oauth2');

morgan.token('date', function () {
    return new Date().toString();
});

morgan.token('grant', function (req, res) {
    if (req.body && req.body.grant_type) {
        return req.body.grant_type;
    } else {
        return '-';
    }
});

morgan.token('oauth-user', function (req, res) {
    if (req.oauth && req.oauth.user) {
        return req.oauth.user.user;
    } else if (req.body && req.body.user) {
        return req.body.user;
    } else {
        return '-';
    }
});

//app.set('env', 'production');
app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :grant :oauth-user'));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' === req.method) {
        res.send(200);
    } else {
        next();
    }
});

//app.get('/', function (req, res) {
//	res.render('demo');
//});

app.get('/example', function (req, res) {
    var path = __dirname + '/views/example.md';
    fs.readFile(path, 'utf8', function (err, data) {
        if (err) {
            res.sendStatus(404);
        } else {
            res.render('markdown', {
                body: marked(data.toString())
            });
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
            res.render('markdown', {
                body: marked(data.toString())
            });
        }
    });
});

app.get('/api/:id', function (req, res) {
    var path = __dirname + '/views/api/' + req.params.id + '.md';
    fs.readFile(path, 'utf8', function (err, data) {
        if (err) {
            res.sendStatus(404);
        } else {
            res.render('markdown', {
                body: marked(data.toString())
            });
        }
    });
});

app.use(express.static(path.join(__dirname, './dist')));

app.use(function (req, res, next) {
    if (req.body.org) {
        req.body.org = req.body.org.toLowerCase();
    }
    next();
});

app.use(function (req, res, next) {
    //	if (req.headers.origin) {
    //		res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    //	}
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

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
    console.error('Url: ' + req.originalUrl);
    console.error(moment().format('YYYY-MM-DD HH:mm:ss'));
    //console.log('clientId: ' + (req.oauth && req.oauthclientId) ? req.oauth.clientId : 'no client');
    if (err.status) {
        console.error(JSON.stringify(err));
        res.status(err.status).jsonp({
            message: err.message,
            debug: err.debug
        });
    } else {
        console.error(err.stack);
        res.status(500).jsonp({
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
