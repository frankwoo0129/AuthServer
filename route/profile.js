/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var async = require('async');
var mongoose = require('mongoose');
var root = require('express').Router();
var UserSchema = require('../schema/addressbook/user');
var token = require('./token');

/**
 * @apiDefine UserProfile
 * @apiSuccess {String} user user ID in org
 * @apiSuccess {String} email
 * @apiSuccess {String} work_phone
 * @apiSuccess {String} mobile_phone
 */

/**
 * @api {get} /account/profile Get Account Profile
 * @apiName getUserConfigure
 * @apiGroup Account
 *
 * @apiHeader {String{32}} authorization Access Token.
 * @apiParam {String} user userID whose profile you want to get. this user'org and yours is the same.
 *
 * @apiUse UserProfile
 */
root.get('/account/profile', token.getToken, function (req, res, next) {
    if (!req.accessToken) {
        next({
            debug: 'no access_token',
            message: 'invalid_grant',
            status: 401
        });
    } else {
        var ret = {},
            connection = mongoose.createConnection('mongodb://localhost:27017/' + req.accessToken.user.org),
            User = new UserSchema(connection);
        if (typeof req.query.user === 'string') {
            User.getUserConfigure(req.query.user, function (err, result) {
                if (err) {
                    next(err);
                } else {
                    res.json(result);
                }
                connection.close();
            });
        } else if (typeof req.query.user === 'object') {
            async.map(req.query.user, User.getUserConfigure, function (err, results) {
                if (err) {
                    next(err);
                } else {
                    res.json(results);
                }
                connection.close();
            });
        } else {
            next({
                message: 'no user',
                status: 400
            });
            connection.close();
        }
    }
});

/**
 * @api {post} /account/profile Set Account Profile
 * @apiName setUserConfigure
 * @apiGroup Account
 *
 * @apiHeader {String{32}} authorization Access Token.
 * @apiParam {String} [email]
 * @apiParam {String} [work_phone]
 * @apiParam {String} [mobile_phone]
 *
 * @apiUse UserProfile
 */
root.post('/account/profile', token.getToken, function (req, res, next) {
    if (!req.accessToken) {
        next({
            debug: 'no access_token',
            message: 'invalid_grant',
            status: 401
        });
    } else {
        var config = {},
            connection = mongoose.createConnection('mongodb://localhost:27017/' + req.accessToken.user.org),
            User = new UserSchema(connection);
        config.email = req.body.email;
        config.mobile_phone = req.body.mobile_phone;
        config.work_phone = req.body.work_phone;
        User.setUserConfigure(req.accessToken.user.user, config, function (err, result) {
            if (err) {
                next(err);
            } else {
                res.json(result);
            }
            connection.close();
        });
    }
});

module.exports = root;
