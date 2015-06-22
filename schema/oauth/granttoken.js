/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var Client = require('./client').Client;
var User = require('./user').User;

/*
 *	Main Key:
 *		device_id
 *		client_id
 */
var GrantTokenSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true
	},
	clientId: {
		type: String,
		required: true
	},
	clientSecret: {
		type: String,
		required: true
	},
	userId: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 60 * 24 * 30 * 3
	},
	expires: {
		type: Number
	}
});

module.exports = function (connection) {
	GrantTokenSchema.path('id').validate(function (value, response) {
		connection.model('GrantToken').findOne({
			id: value
		}, function (err, result) {
			if (err) {
				response(false);
			} else if (!result) {
				response(true);
			} else {
				response(false);
			}
		});
	}, 'Validation of {id} failed');

	var GrantToken = connection.model('GrantToken', GrantTokenSchema);
	return GrantToken;
};
