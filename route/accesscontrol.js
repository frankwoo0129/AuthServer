/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var root = require('express').Router();
var ACLEntry = require('../schema/aclentry');

root.get('/', function (req, res) {
	res.send('Home');
});

/*
 *  get this client detail
 */
root.get('/:clientId', function (req, res, next) {

});

/*
 *  new a client ACL
 */
root.post('/clientId', function (req, res, next) {

});

/*
 *  edit this client ACL
 */
root.put('/:clientId', function (req, res, next) {

});

/*
 *  delte this client ACL
 */
root.delete('/:clientId', function (req, res, next) {

});

/*
 *  get All entry
 */
root.get('/:clientId/entry', function (req, res, next) {
	
});

/*
 *  get the entry detail 
 */
root.get('/:clientId/entry/:name', function (req, res, next) {

});

/*
 *  enable role in this entry 
 */
root.post('/:clientId/entry/:name/role', function (req, res, next) {

});

/*
 *  disable role in this entry 
 */
root.delete('/:clientId/entry/:name/role', function (req, res, next) {

});

/*
 *
 */
root.post('/:clientId/entry/:name/member', function (req, res, next) {

});

/*
 *
 */
root.delete('/:clientId/entry/:name/member', function (req, res, next) {

});