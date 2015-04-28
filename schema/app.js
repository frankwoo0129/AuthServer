/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var Client = require('./client');

/*
 *	Main Key:
 *		name
 *		os
 *		version
 */
var AppSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true
	},
	name: {
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
	owner: {
		type: mongoose.Schema.Types.Mixed,
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

var App = mongoose.model('App', AppSchema);

AppSchema.pre('save', function (next) {
	var self = this;
	App.findOne({
		name: self.name,
		os: self.os,
		version: self.version
	}, function (err, result) {
		if (err) {
			next(err);
		} else if (result) {
			next(new Error('It already exists, app_id=' + result.id));
		} else {
			next();
		}
	});
});

AppSchema.pre('save', function (next) {
	var self = this;
	Client.findOne({
		user: self.owner.user,
		org: self.owner.org
	}, function (err, result) {
		if (err) {
			next(err);
		} else if (!result) {
			next(new Error('No this owner'));
		} else {
			next();
		}
	});
});

AppSchema.path('id').validate(function (value, response) {
	var self = this;
	App.findOne({
		id: value
	}, function (err, result) {
		if (err) {
			response(false);
		} else if (result) {
			response(false);
		} else {
			response(true);
		}
	});
}, 'Validation of {id} failed');

module.exports = App;
