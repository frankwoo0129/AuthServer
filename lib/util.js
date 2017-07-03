/*jslint node: true */
"use strict";

var crypto = require('crypto');

var randomString = function (chars, leng1) {
    return function (leng2) {
        var rnd = crypto.randomBytes(leng1 || leng2),
            value = [],
            len = chars.length,
            i;
        for (i = 0; i < (leng1 || leng2); i = i + 1) {
            value.push(chars[rnd[i] % len]);
        }
        return value.join('');
    };
};

var md5sum = function (msg) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(msg);
    return md5sum.digest('hex');
};

var encrypt_ctr = function (text, secret) {
    var cipher = crypto.createCipher('aes-256-ctr', secret),
        crypted = cipher.update(text, 'utf8', 'base64');
    crypted += cipher.final('base64');
    return crypted;
};

var decrypt_ctr = function (text, secret) {
    var decipher = crypto.createDecipher('aes-256-ctr', secret),
        dec = decipher.update(text, 'base64', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};

var encrypt_gcm = function (plain, secret, iv) {
    var cipher,
        encrypt = crypto.createCipheriv('aes-256-gcm', secret, iv);
    cipher = encrypt.update(plain, 'utf8', 'base64');
    cipher += encrypt.final('base64');
    return {
        content: cipher,
        tag: encrypt.getAuthTag()
    };
};

var decrypt_gcm = function (cipher, secret, iv) {
    var decrypt = crypto.createDecipheriv('aes-256-gcm', secret, iv),
        plain;
    decrypt.setAuthTag(cipher.tag);
    plain = decrypt.update(cipher.content, 'base64', 'utf8');
    plain += decrypt.final('utf8');
    return plain;
};

module.exports.encrypt_ctr = encrypt_ctr;
module.exports.decrypt_ctr = decrypt_ctr;
module.exports.encrypt_gcm = encrypt_gcm;
module.exports.decrypt_gcm = decrypt_gcm;
module.exports.md5sum = md5sum;
module.exports.randomString = randomString;
