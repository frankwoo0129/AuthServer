/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var root = require('express').Router();
var ACLEntry = require('../schema/aclentry').ACLEntry;

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
root.post('/', function (req, res, next) {

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
 *  
 */
root.get('/:clientId/entry', function (req, res, next) {

});

/*
 *  
 */
root.delete('/:clientId', function (req, res, next) {

});

/*
 *  
 */
root.delete('/:clientId', function (req, res, next) {

});

/*
 *  
 */
root.delete('/:clientId', function (req, res, next) {

});

