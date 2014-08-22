var assert = require('assert'),
    request = require('supertest'),
    express = require('express');

describe('init/server', function (){
    var app = require('../app-maker')();
    
    it('should have the underlying express object as property', function () {
        assert.equal('function', typeof app.expressApp);
    });
    
    it('should create the server object', function () {
        assert(app.server);
    });
    
    it('should setup the socket.io listener', function () {
        assert(app.sockets);
    });
     
    it('should serve socket.io static files from root', function (done) {
        request(app.server)
            .get('/socket.io/socket.io.js')
            .expect(200, done);
    });
});
