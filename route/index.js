/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var oauth2 = require('../lib/oauth2');
var root = require('express').Router();
var account = require('./account');
var token = require('./token');
var device = require('./device');
var client = require('./client');
var acl = require('./accesscontrol');
var profile = require('./profile');

/**
 * @apiDefine ReturnUserInfo
 * @apiSuccess {Object} user User information.
 * @apiSuccess {String{32}} user.id User ID.
 * @apiSuccess {String} user.user User ID in org.
 * @apiSuccess {String} user.org User org.
 * @apiSuccess {Number} expires  Expired time.
 */

/**
 * @api {get} /oauth/token/:access_token Check Access Token
 * @apiName CheckAccessToken
 * @apiGroup OAuth
 *
 * @apiHeader {String} authorization Basic authorization with clientId and clientSecret
 * @apiParam {String{32}} access_token Access Token.
 *
 * @apiUse ReturnUserInfo
 */
root.get('/oauth/token/:accessToken', token.checkClient, function (req, res, next) {
    if (req.oauth) {
        oauth2.getAccessToken(req.params.accessToken, function (err, accessToken) {
            if (err) {
                next(err);
            } else if (!accessToken) {
                next({
                    debug: 'no this token',
                    message: 'invalid_token',
                    status: 401
                });
            } else {
                var expire = (accessToken.expires.getTime() - new Date().getTime()) / 1000;
                if (expire < 0) {
                    next({
                        debug: 'token expired',
                        message: 'invalid_token',
                        status: 401
                    });
                } else {
                    res.status(200).json({
                        user: accessToken.user,
                        expires: expire
                    });
                }
            }
        });
    } else {
        return next({
            message: 'invalid_client',
            status: 401
        });
    }
});

/**
 * @api {post} /oauth/token Get Access Token
 * @apiName GetAccessToken
 * @apiGroup OAuth
 *
 * @apiHeader {String} authorization Basic authorization with clientId and clientSecret
 * @apiParam {String="refresh_token","password"} grant_type only two options
 * @apiParam {String{32}} [userId] if grant_type is "password"
 * @apiParam {String} [user] if grant_type is "password"
 * @apiParam {String} [org] if grant_type is "password"
 * @apiParam {String} [password] if grant_type is "password"
 * @apiParam {String{32}} [refresh_token] if grant_type is "refresh_token"
 *
 * @apiSuccess {String{32}} access_token Access Token
 * @apiSuccess {String{32}} [refresh_token] Refresh Token.
 * @apiSuccess {String} token_type Always 'Bearer'.
 * @apiUse ReturnUserInfo
 */
root.post('/oauth/token', token.postToGetToken);
root.use(profile);
root.use(account);
root.use(device);
root.use(client);
root.use(acl);

module.exports = root;
