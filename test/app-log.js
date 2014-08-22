var assert = require('assert'),
    request = require('supertest'),
    socketClient = require('socket.io-client'),
    _ = require('underscore'),
    debug = require('debug');

var log = debug('apper:test');

describe('app-log', function (){
    it('should handle /_logs route for root server logs', function (done) {
        var app = require('./app-maker')();
        request(app.server)
            .get('/_logs')
            .end(function (err, reqRes) {
                if (err) { return done(err); }
                
                var json = reqRes.res.body;
                
                [
                    'Loaded environment.',
                    'Loaded middleware.',
                    'Loaded sockets.',
                    'Loaded routes.'
                ].forEach(function (msg) {
                    assert(_.some(json, function (logItem) {
                        return logItem.mountPath === '' && logItem.data[0] === msg;
                    }));
                });
                
                done();
            });
    });
    
    it('should handle /subapp/_logs route for subapp server logs', function (done) {
        var app = require('./app-maker')();
        request(app.server)
            .get('/subapp/_logs')
            .end(function (err, reqRes) {
                if (err) { return done(err); }
                
                var json = reqRes.res.body;
                
                [
                    'Loaded middleware.',
                    'Loaded routes.'
                ].forEach(function (msg) {
                    assert(_.some(json, function (logItem) {
                        return logItem.mountPath === '/subapp' && logItem.data[0] === msg;
                    }));
                });
                
                done();
            });
    });
    
    it('accepts logs from clients using sockets', function (done) {
        var app = require('./app-maker')();
        app.start(function () {
            var serverAddress = app.server.address(),
                socketURL = 'http://localhost:' + serverAddress.port + '/';
            
            var client = socketClient(socketURL),
                logData = { key: 'value' };
            
            app.expressApp.sockets.on('connection', function (socket) {
                socket.on('_log', function (logData) {
                    socket.emit('_log_confirmed', logData);
                });
            });
            
            client.on('connect', function () {
                client.emit('_log', logData);
            });
        
            client.on('_log_confirmed', function (confirmationData) {
                Object.keys(logData).forEach(function (key) {
                    assert.equal(logData[key], confirmationData[key]);
                });
                
                request(app.server)
                    .get('/_logs')
                    .end(function (err, reqRes) {
                        if (err) { return done(err); }
                        
                        var json = reqRes.res.body;

                        assert(_.some(json, function (logItem) {
                            return _.isEqual(logItem.data[0], logData) && logItem.client === client.io.engine.id;
                        }));

                        done();
                    });
            });
        });
    });
});
