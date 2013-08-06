"use strict";

var redis = require("redis"),
    client = redis.createClient();

function createKey(path, fileType) {
	if ('string' !== typeof fileType) {
		fileType = '';
	}
	return fileType + ':' + path;
}

createKey('path', null);

client.on('error', function(err) {
	console.log('Redis error ' + error);
})


// client.set('mykey', 'myval', redis.print);
client.get('mykey', function(err, data) {
	console.log('err ', err);
	console.log('data ', data);
});

