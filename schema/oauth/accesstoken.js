/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');

var AccessTokenSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true
	},
	user: {
		type: Object,
		required: true
	},
	clientId: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 60 * 24
	},
	expires: {
		type: Date
	}
});

module.exports = function (connection) {
	AccessTokenSchema.path('id').validate(function (value, response) {
		connection.model('AccessToken').findOne({
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

	var AccessToken = connection.model('AccessToken', AccessTokenSchema);
	return AccessToken;
};
