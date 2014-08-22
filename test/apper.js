var assert = require('assert');

describe('apper', function () {
    var apper = require('../'),
        App = require('../lib/app');

    it('should be a function', function () {
        assert.equal('function', typeof apper);
    });
    
    it('should expose underlying app constructor', function () {
        assert.equal(App, apper.App);
    });
});