/*jslint node: true */
/*jslint es5: true */
'use strict';

var mongoose = require('mongoose');
var md5 = require('../lib/md5');

var WebSchema = new mongoose.Schema({
	clientId: {
		type: String,
		require: true
	},
	id: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});
