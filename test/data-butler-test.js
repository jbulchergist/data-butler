"use strict";

var vows   = require('vows'),
		assert = require('assert');

var suite = vows.describe('Butler exam.'),
		redis = require('redis'),
		client = redis.createClient(),
		butler = require('../lib/data-butler');

var testFile = 'README.md';
var testKey = ':/README.md';

suite.addBatch({
	'Prep Redis': {
		'topic': function() {
			client.del(testKey);
			client.get(testKey, this.callback);
		},
		'redis key does not exist': function(err, data) {
			assert.isNull(err);
			assert.isNull(data);
		}
	}
});

suite.addBatch({
	'Test redis cache': {
		'topic': function() {
			var mythis = this;
			var testEntrust = function(err, data) {
				client.get(testKey, mythis.callback);
			}
			butler.entrust('utf8', testFile, testEntrust);
		},
		'access redis key': function(err, data) {
			assert.isNull(err);
			assert.isNotNull(data);
			client.del(testKey);
		}
	}
});

suite.export(module);