var assert = require('assert'),
    request = require('supertest');

describe('init/env-middleware', function () {
    var app = require('../app-maker')();
    
    it('should load the environment for app', function () {
        assert.equal('env value', app.expressApp.get('env property'));
    });
    
    it('should load the middleware for app', function (done) {
        app.expressApp.get('/middleware', function (req, res) {
            res.end(req.middlewareProperty);
        });
        
        request(app.server).get('/middleware').expect('lol', done);
    });
    
    it('should load the middleware for post requests', function (done) {
        app.expressApp.post('/post', function (req, res) {
            res.end(req.body.data);
        });
        
        var body = { data: 'some data' };
        request(app.server).post('/post').send(body).expect(body.data, done);
    });
});
