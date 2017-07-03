/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var md5sum = require('../../lib/util').md5sum;
var randomPassword = require('../../lib/util').randomString("abcdefghijklmnpqrstuwxyz123456789");

var UserSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    username: String,
    password: {
        type: String,
        required: true
    },
    org: {
        type: String,
        required: true
    },
    strategy: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expired: {
        type: Boolean,
        default: false
    },
    changePassword: {
        type: Boolean,
        default: true
    }
});

module.exports = function (connection) {
    UserSchema.pre('save', function (next) {
        var self = this;
        connection.model('User').findOne({
            user: self.user,
            org: self.org
        }, function (err, result) {
            if (err) {
                next(err);
            } else if (result) {
                next(new Error('this user is exists'));
            } else {
                next();
            }
        });
    });

    UserSchema.statics.generateId = function (user, org, callback) {
        var plain = {
                user: user,
                org: org,
                createdAt: new Date()
            },
            id = md5sum(JSON.stringify(plain));
        connection.model('User').findOne({
            id: id
        }, function (err, result) {
            if (err) {
                callback(err);
            } else if (result) {
                setTimeout(function () {
                    UserSchema.statics.generateId(user, org, callback);
                }, 100);
            } else {
                callback(null, id);
            }
        });
    };

    UserSchema.statics.getUserId = function (user, org, callback) {
        var query = {
            user: user,
            org: org
        };
        connection.model('User').findOne(query, {
            id: true,
            user: true,
            org: true,
            "_id": false
        }, function (err, result) {
            if (err) {
                callback(err);
            } else if (!result) {
                callback({
                    debug: 'result is Not found when getUserId, query=' + JSON.stringify(query),
                    message: 'No this user',
                    status: 404
                });
            } else {
                callback(null, result);
            }
        });
    };

    UserSchema.statics.getUserIdByOrg = function (org) {
        return function (user, callback) {
            UserSchema.statics.getUserId(user, org, callback);
        };
    };

    UserSchema.statics.getUser = function (userId, callback) {
        var query = {
            id: userId
        };
        connection.model('User').findOne(query, {
            id: true,
            user: true,
            org: true,
            "_id": false
        }, function (err, result) {
            if (err) {
                callback(err);
            } else if (!result) {
                callback({
                    debug: 'result is Not found when getUser, query=' + JSON.stringify(query),
                    message: 'No this user',
                    status: 404
                });
            } else {
                callback(null, result);
            }
        });
    };

    UserSchema.statics.addUser = function (user, org, callback) {
        UserSchema.statics.generateId(user, org, function (err, id) {
            if (err) {
                callback(err);
            } else {
                var User = connection.model('User'),
                    newUser = new User();
                if (org === 'foxconn') {
                    newUser.strategy = org;
                }

                newUser.username = user;
                newUser.user = user;
                newUser.org = org;
                newUser.id = id;
                newUser.password = randomPassword(6);
                newUser.save(function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, {
                            id: newUser.id,
                            user: newUser.user,
                            username: newUser.username,
                            org: newUser.org,
                            password: newUser.password
                        });
                    }
                });
            }
        });
    };

    UserSchema.statics.deleteUser = function (userId, callback) {
        var query = {
            id: userId
        };
        connection.model('User').findOne(query, function (err, result) {
            if (err) {
                callback(err);
            } else if (!result) {
                callback({
                    debug: 'result is Not found when deleteUser, query=' + JSON.stringify(query),
                    message: 'No this user',
                    status: 404
                });
            } else {
                result.remove(function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback();
                    }
                });
            }
        });
    };

    UserSchema.statics.changePassword = function (userId, password, newPassword, callback) {
        var query = {
            id: userId,
            password: password
        };
        connection.model('User').findOne(query, function (err, result) {
            if (err) {
                callback(err);
            } else if (!result) {
                callback({
                    debug: 'result is Not found when changePassword, query=' + JSON.stringify(query),
                    message: 'Auth Error',
                    status: 401
                });
            } else {
                result.password = newPassword;
                result.changePassword = false;
                result.save(function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback();
                    }
                });
            }
        });
    };

    UserSchema.statics.resetPassword = function (userId, callback) {
        var query = {
            id: userId
        };
        connection.model('User').findOne(query, function (err, result) {
            if (err) {
                callback(err);
            } else if (!result) {
                callback({
                    debug: 'result is Not found when resetPassword, query=' + JSON.stringify(query),
                    message: 'No this user',
                    status: 404
                });
            } else {
                result.password = randomPassword(6);
                result.changePassword = true;
                result.save(function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, {
                            id: result.id,
                            password: result.password
                        });
                    }
                });
            }
        });
    };

    var User = connection.model('User', UserSchema);
    return User;
};
