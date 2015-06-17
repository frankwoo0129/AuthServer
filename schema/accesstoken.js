/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');

var AccessTokenSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true
	},
	userId: {
		type: String,
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

var AccessToken = mongoose.model('AccessToken', AccessTokenSchema);

AccessTokenSchema.path('id').validate(function (value, response) {
	AccessToken.findOne({
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

module.exports = AccessToken;
