/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var md5sum = require('../../lib/util').md5sum;
//var ValidationError = require('mongoose').Error.ValidationError;

var DeviceSchema = new mongoose.Schema({
    clientId: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    lang: {
        type: String,
        default: 'zh_tw'
    },
    imei: {
        type: String,
        required: true
    },
    serialId: {
        type: String,
        required: true
    },
    deviceType: {
        type: String,
        required: true
    },
    os: {
        type: String,
        required: true
    },
    version: {
        type: String,
        required: true
    },
    expired: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = function (connection) {

    DeviceSchema.pre('save', function (next) {
        var self = this;
        connection.model('Device').remove({
            clientId: self.clientId,
            imei: self.imei,
            serialId: self.serialId,
            deviceType: self.deviceType,
            os: self.os,
        }, function (err, result) {
            if (err) {
                next(err);
            } else {
                next();
            }
        });
    });

    DeviceSchema.statics.generateId = function (clientId, imei, serialId, deviceType, os, callback) {
        var plain = {
                clientId: clientId,
                imei: imei,
                serialId: serialId,
                deviceType: deviceType,
                os: os,
                createdAt: new Date()
            },
            id = md5sum(JSON.stringify(plain));
        connection.model('Device').findOne({
            id: id
        }, function (err, result) {
            if (err) {
                callback(err);
            } else if (result) {
                setTimeout(function () {
                    DeviceSchema.statics.generateId(imei, serialId, deviceType, os, callback);
                }, 100);
            } else {
                callback(null, id);
            }
        });
    };

    DeviceSchema.statics.getDevice = function (deviceId, callback) {
        var query = {
            id: deviceId
        };
        connection.model('Device').findOne(query, {
            id: true,
            lang: true,
            imei: true,
            serialId: true,
            deviceType: true,
            os: true,
            version: true,
            "_id": false
        }, function (err, result) {
            if (err) {
                callback(err);
            } else if (!result) {
                callback({
                    debug: 'result is Not found when getDevice, query=' + JSON.stringify(query),
                    message: 'No this device',
                    status: 404
                });
            } else {
                callback(null, result);
            }
        });
    };

    DeviceSchema.statics.addDevice = function (config, clientId, callback) {
        DeviceSchema.statics.generateId(clientId, config.imei, config.serialId, config.deviceType, config.os, function (err, id) {
            var Device = connection.model('Device'),
                newDevice = new Device();
            newDevice.lang = config.lang;
            newDevice.imei = config.imei;
            newDevice.serialId = config.serialId;
            newDevice.deviceType = config.deviceType;
            newDevice.os = config.os;
            newDevice.version = config.version;
            newDevice.id = id;
            newDevice.clientId = clientId;

            newDevice.save(function (err) {
                if (err) {
                    //				// TODO
                    //				if (err instanceof ValidationError) {
                    //					console.log(err);
                    //					var message = [];
                    //					if (err.errors) {
                    //						Object.keys(err.errors).forEach(function (key) {
                    //							message.push(String(err.errors[key]));
                    //						});
                    //						res.status(400).json({
                    //							message: message
                    //						});
                    //					} else {
                    //						res.status(400).json({
                    //							message: err.message
                    //						});
                    //					}
                    //				} else {
                    //					next(err);
                    //				}
                    callback(err);
                } else {
                    callback(null, {
                        id: newDevice.id,
                        lang: newDevice.lang,
                        imei: newDevice.imei,
                        serialId: newDevice.serialId,
                        deviceType: newDevice.deviceType,
                        os: newDevice.os,
                        version: newDevice.version
                    });
                }
            });
        });
    };

    DeviceSchema.statics.deleteDevice = function (deviceId, callback) {
        var query = {
            id: deviceId
        };
        connection.model('Device').findOne(query, function (err, result) {
            if (err) {
                callback(err);
            } else if (!result) {
                callback({
                    debug: 'result is Not found when deleteDevice, query=' + JSON.stringify(query),
                    message: 'No this app',
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

    var Device = connection.model('Device', DeviceSchema);
    return Device;
};
