var log = require('logger')('user-service:test:create');
var should = require('should');
var request = require('request');
var pot = require('pot');

describe.only('POST /users', function () {
    before(function (done) {
        pot.start(done);
    });

    after(function (done) {
        pot.stop(done);
    });

    it('with no media type', function (done) {
        request({
            uri: pot.resolve('/apis/v/users'),
            method: 'POST'
        }, function (e, r, b) {
            if (e) {
                return done(e);
            }
            r.statusCode.should.equal(415);
            should.exist(b);
            b = JSON.parse(b);
            should.exist(b.code);
            should.exist(b.message);
            b.code.should.equal('unsupported-media-type');
            done();
        });
    });

    it('with unsupported media type', function (done) {
        request({
            uri: pot.resolve('/apis/v/users'),
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            }
        }, function (e, r, b) {
            if (e) {
                return done(e);
            }
            r.statusCode.should.equal(415);
            should.exist(b);
            b = JSON.parse(b);
            should.exist(b.code);
            should.exist(b.message);
            b.code.should.equal('unsupported-media-type');
            done();
        });
    });

    it('without email address', function (done) {
        request({
            uri: pot.resolve('/apis/v/users'),
            method: 'POST',
            json: {}
        }, function (e, r, b) {
            if (e) {
                return done(e);
            }
            r.statusCode.should.equal(422);
            should.exist(b);
            should.exist(b.code);
            should.exist(b.message);
            b.code.should.equal('validation-error');
            done();
        });
    });

    it('with malformed email address (no @)', function (done) {
        request({
            uri: pot.resolve('/apis/v/users'),
            method: 'POST',
            json: {
                email: 'serandives'
            }
        }, function (e, r, b) {
            if (e) {
                return done(e);
            }
            r.statusCode.should.equal(422);
            should.exist(b);
            should.exist(b.code);
            should.exist(b.message);
            b.code.should.equal('validation-error');
            done();
        });
    });

    it('with malformed email address (no .)', function (done) {
        request({
            uri: pot.resolve('/apis/v/users'),
            method: 'POST',
            json: {
                email: 'serandives@com'
            }
        }, function (e, r, b) {
            if (e) {
                return done(e);
            }
            r.statusCode.should.equal(422);
            should.exist(b);
            should.exist(b.code);
            should.exist(b.message);
            b.code.should.equal('validation-error');
            done();
        });
    });

    it('with malformed email address (@ after .)', function (done) {
        request({
            uri: pot.resolve('/apis/v/users'),
            method: 'POST',
            json: {
                email: 'serand.ives@com'
            }
        }, function (e, r, b) {
            if (e) {
                return done(e);
            }
            r.statusCode.should.equal(422);
            should.exist(b);
            should.exist(b.code);
            should.exist(b.message);
            b.code.should.equal('validation-error');
            done();
        });
    });

    it('without password', function (done) {
        request({
            uri: pot.resolve('/apis/v/users'),
            method: 'POST',
            json: {
                email: 'user@serandives.com'
            }
        }, function (e, r, b) {
            if (e) {
                return done(e);
            }
            r.statusCode.should.equal(422);
            should.exist(b);
            should.exist(b.code);
            should.exist(b.message);
            b.code.should.equal('validation-error');
            done();
        });
    });

    it('password without a number', function (done) {
        request({
            uri: pot.resolve('/apis/v/users'),
            method: 'POST',
            json: {
                email: 'user@serandives.com',
                password: 'Hello'
            }
        }, function (e, r, b) {
            if (e) {
                return done(e);
            }
            r.statusCode.should.equal(422);
            should.exist(b);
            should.exist(b.code);
            should.exist(b.message);
            b.code.should.equal('validation-error');
            done();
        });
    });

    it('password without an upper case letter', function (done) {
        request({
            uri: pot.resolve('/apis/v/users'),
            method: 'POST',
            json: {
                email: 'user@serandives.com',
                password: 'hello1'
            }
        }, function (e, r, b) {
            if (e) {
                return done(e);
            }
            r.statusCode.should.equal(422);
            should.exist(b);
            should.exist(b.code);
            should.exist(b.message);
            b.code.should.equal('validation-error');
            done();
        });
    });

    it('password without a lower case letter', function (done) {
        request({
            uri: pot.resolve('/apis/v/users'),
            method: 'POST',
            json: {
                email: 'user@serandives.com',
                password: 'HELLO1'
            }
        }, function (e, r, b) {
            if (e) {
                return done(e);
            }
            r.statusCode.should.equal(422);
            should.exist(b);
            should.exist(b.code);
            should.exist(b.message);
            b.code.should.equal('validation-error');
            done();
        });
    });

    it('password same as email', function (done) {
        request({
            uri: pot.resolve('/apis/v/users'),
            method: 'POST',
            json: {
                email: 'User@serandives.com',
                password: 'use@Serandives.com'
            }
        }, function (e, r, b) {
            if (e) {
                return done(e);
            }
            r.statusCode.should.equal(422);
            should.exist(b);
            should.exist(b.code);
            should.exist(b.message);
            b.code.should.equal('validation-error');
            done();
        });
    });

    it('with existing email', function (done) {
        request({
            uri: pot.resolve('/apis/v/users'),
            method: 'POST',
            json: {
                email: 'admin@serandives.com',
                password: '1@2.Com'
            }
        }, function (e, r, b) {
            if (e) {
                return done(e);
            }
            r.statusCode.should.equal(409);
            should.exist(b);
            should.exist(b.code);
            should.exist(b.message);
            b.code.should.equal('content-conflict');
            done();
        });
    });

    it('with new email', function (done) {
        request({
            uri: pot.resolve('/apis/v/users'),
            method: 'POST',
            json: {
                email: 'user@serandives.com',
                password: '1@2.Com'
            }
        }, function (e, r, b) {
            if (e) {
                return done(e);
            }
            r.statusCode.should.equal(201);
            should.exist(b);
            should.exist(b.id);
            should.exist(b.email);
            b.email.should.equal('user@serandives.com');
            should.exist(r.headers['location']);
            r.headers['location'].should.equal(pot.resolve('/apis/v/users/' + b.id));
            done();
        });
    });
});