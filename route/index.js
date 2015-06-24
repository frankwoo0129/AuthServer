/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var oauth2 = require('../lib/oauth2');
var root = require('express').Router();
var account = require('./account');
var token = require('./token');
//var auth = require('./authorization');
var device = require('./device');
var client = require('./client');
var acl = require('./accesscontrol');

//root.post('/auth', checkClient, auth);
root.get('/oauth/token', token.getToken);
root.post('/oauth/token', token.postToGetToken);
root.use('/account', account);
root.use('/device', device);
root.use('/client', client);
root.use('/acl', acl);

module.exports = root;
