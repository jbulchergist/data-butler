"use strict";
var spot = require('spot'),
		redis = require('redis'),
		client = redis.createClient();

client.on('error', function(err) {
	console.log('Redis error ' + err);
});

var _registeredTypes = {
	unregistered: {
			path: "",
			expire: 200
	}
}

var config = {
	cache: true
}

// track files we are retrieving, instead of retrieving them
// from the filesystem multiple times
var waiting = [];

function createKey(path, file, fileType) {
	var key = ':' + path;
	if ('string' === typeof file) {
		key = key + '/' + file;
	}
	if ('string' === typeof fileType) {
		key = fileType + key;
	}
	return key;
}

var DataButler = (function(){

	var dataButler = function (conf) {}

	//
	// ### function fetch(fileType, dir, encoding, cb)
	// #### @fileType {string} the identifier for this set of settings
	// #### @dir {string} the path (relative to the project root)
	//										to the files the identifier manages
	// #### @encoding {string} encoding to use when reading the file
	// #### @cb {function} callback to handle the file
	// #### @processCB {function} a callback for processing files after
	//                            loading them from disk
	// Train the butler how to handle files
	//
	dataButler.prototype.train = function(fileType, dir, encoding, cb, processCB) {
		// butler's know how to train staff to manage
		spot.train(fileType, dir, encoding, cb, processCB);

		if ('Ojbect' !== typeof _registeredTypes[fileType]) {
			_registeredTypes[fileType] = {};
		}
		_registeredTypes[fileType] = {
			path: dir,
			cb: cb
		}
	};

	//
	// ### function function(typeOrEncoding, file, cb)
	// #### @fileType {string} use a a fileType used during training to use
	//												 those settings. If a configuration is not
	//												 found, this will be used as the encoding.
	// #### @file {file} path to the file, relative to the configuration
	// #### @cb {function} optional callback to handle the file
	// Entrust the butler to fetch a file and perform the callback on it.
	//
	dataButler.prototype.entrust = function(fileType, file, cb) {
		var cache = function(err, data) {
				// console.log('err: ',  err, 'data', data);
			if (err) {
				return cb(err);
			}
			client.setex(key, 200, data, cb);
		}
		var manage = function(err, data) {
			if (err) {
				return cb(err);
			}
			if (null === data) {
				spot.fetch(fileType, file, cache);
			} else {
				cb(null, data);
			}
		}

		var key = '';
		var typeConf = {};
		if ('string' !== typeof fileType || 'string' !== typeof fileType) {
			err = new Error('dataButler.entrust expects a fileType and the path to a file as parameters.');
			return cb(err);
		}
		if ('undefined' === typeof _registeredTypes[fileType]) {
			if ('function' !== typeof cb) {
				err = new Error('could not find ' + fileType + ' among registeredTypes and there was no callback supplied. Supply a callback or tain the data-butler.');
				return cb(err);
			}
			typeConf = _registeredTypes.unregistered;
			key = createKey(typeConf.path, file);
		} else {
			typeConf = _registeredTypes[fileType];
			key = createKey(typeConf.path, file, typeConf.fileType);
		}

		client.get(key, manage);
	};

	return dataButler;
})();

module.exports = new DataButler();