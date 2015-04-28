/*jslint node: true */
"use strict";

var fs = require('fs');
var ursa = require('ursa');
var moment = require('moment');
var private_key = './cert/my-server.key.pem';
var public_key = './cert/my-server.pub';

var key = ursa.createPrivateKey(fs.readFileSync(private_key));
var crt = ursa.createPublicKey(fs.readFileSync(public_key));

//var msg;
//console.log('Encrypt with Public');
//msg = crt.encrypt("Everything is going to be 200 OK", 'utf8', 'base64');
//console.log('encrypted', msg, '\n');
//
//console.log('Decrypt with Private');
//msg = key.decrypt(msg, 'base64', 'utf8');
//console.log('decrypted', msg, '\n');

var encrypt = function (msg) {
	return crt.encrypt(msg, 'utf8', 'base64');
};

var decrypt = function (msg) {
	return key.decrypt(msg, 'base64', 'utf8');
};

module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;

//var plain = {};
//plain.app_id = 'd17f32cf87f55ea7284ff09653d982e5';
//plain.device_id = '92a85f48beba4d7829274605b0b3562d';
//plain.client_id = 'c0b22f712913980a527574803ba929b9';
//plain.date = moment().format();
//var cipher = encrypt(JSON.stringify(plain));
//console.log(cipher);
//console.log(JSON.parse(decrypt(cipher)));
