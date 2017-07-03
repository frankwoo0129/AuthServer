/*jslint node: true */
/*jslint nomen: true */
/*jslint es5: true */
"use strict";

var async = require('async');
var root = require('express').Router();
var User = require('../schema/oauth').User;

/**
 * @apiDefine ReturnUserInfo
 * @apiSuccess {String} id
 * @apiSuccess {String} user
 * @apiSuccess {String} org
 */

/**
 * @api {get} /account Get User ID
 * @apiName getUserId
 * @apiGroup Account
 *
 * @apiParam {String} user
 * @apiParam {String} org
 *
 * @apiUse ReturnUserInfo
 */
root.get('/account', function (req, res, next) {
    if (!req.query.user) {
        next({
            message: 'no user',
            status: 400
        });
    } else if (!req.query.org) {
        next({
            message: 'no org',
            status: 400
        });
    } else {
        User.getUserId(req.query.user, req.query.org, function (err, user) {
            if (err) {
                next(err);
            } else {
                res.json(user);
            }
        });
    }
});

/**
 * @api {get} /account/:userId Get User
 * @apiName getUser
 * @apiGroup Account
 *
 * @apiParam {String} userId
 *
 * @apiUse ReturnUserInfo
 */
root.get('/account/:userId', function (req, res, next) {
    User.getUser(req.params.userId, function (err, user) {
        if (err) {
            next(err);
        } else {
            res.json(user);
        }
    });
});

/**
 * @api {post} /account New User
 * @apiName addUser
 * @apiGroup Account
 *
 * @apiParam {String} user
 * @apiParam {String} org
 *
 * @apiUse ReturnUserInfo
 * @apiSuccess {String} password default password
 */
root.post('/account', function (req, res, next) {
    if (!req.body.user) {
        next({
            message: 'no user',
            status: 400
        });
    } else if (!req.body.org) {
        next({
            message: 'no org',
            status: 400
        });
    } else {
        User.addUser(req.body.user, req.body.org, function (err, user) {
            if (err) {
                next(err);
            } else {
                res.json(user);
            }
        });
    }
});

/**
 * @api {post} /account/resetpassword Reset Password
 * @apiName resetPassword
 * @apiGroup Account
 *
 * @apiParam {String} userId
 *
 * @apiSuccess {String} id
 * @apiSuccess {String} password
 */
root.post('/account/resetpassword', function (req, res, next) {
    if (!req.body.userId) {
        next({
            message: 'no userId',
            status: 400
        });
    } else {
        User.resetPassword(req.body.userId, function (err, result) {
            if (err) {
                next(err);
            } else {
                res.json(result);
            }
        });
    }
});

/**
 * @api {post} /account/changepassword Change Password
 * @apiName changePassword
 * @apiGroup Account
 *
 * @apiParam {String} userId
 * @apiParam {String} password
 * @apiParam {String} newpassword
 */
root.post('/account/changepassword', function (req, res, next) {
    if (!req.body.userId) {
        next({
            message: 'no userId',
            status: 400
        });
    } else if (!req.body.password) {
        next({
            message: 'no password',
            status: 400
        });
    } else if (!req.body.newpassword) {
        next({
            message: 'no newpassword',
            status: 400
        });
    } else {
        User.changePassword(req.body.userId, req.body.password, req.body.newpassword, function (err, result) {
            if (err) {
                next(err);
            } else {
                res.sendStatus(200);
            }
        });
    }
});

/**
 * @api {delete} /account/:userId Delete User
 * @apiName deleteUser
 * @apiGroup Account
 *
 * @apiParam {String} userId
 */
root.delete('/account/:userId', function (req, res, next) {
    User.deleteUser(req.params.userId, function (err, user) {
        if (err) {
            next(err);
        } else {
            res.sendStatus(200);
        }
    });
});

module.exports = root;
