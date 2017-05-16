var log = require('logger')('user-service:test:find');
var should = require('should');
var request = require('request');
var pot = require('pot');

describe('GET /users', function () {
    var serandivesId;
    var user;
    before(function (done) {
        pot.start(function (err) {
            if (err) {
                return done(err);
            }
            request({
                uri: pot.resolve('/apis/v/configs/boot'),
                method: 'POST',
                json: {
                    email: 'user@serandives.com',
                    password: '1@2.Com'
                }
            }, function (e, r, b) {
                if (e) {
                    return done(e);
                }
                r.statusCode.should.equal(200);
                log.info(b);
                should.exist(b);
                should.exist(b.name);
                b.name.should.equal('boot');
                should.exist(b.value);
                should.exist(b.value.clients);
                should.exist(b.value.clients.serandives);
                serandivesId = b.value.clients.serandives;
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
                    user = b;
                    done();
                });
            });
        });
    });

    after(function (done) {
        pot.stop(done);
    });

    it('GET /users/:id', function (done) {
        request({
            uri: pot.resolve('/apis/v/users/' + user.id),
            method: 'GET',
            json: true
        }, function (e, r, b) {
            if (e) {
                return done(e);
            }
            r.statusCode.should.equal(200);
            should.exist(b);
            should.exist(b.id);
            should.exist(b.email);
            b.id.should.equal(user);
            b.email.should.equal('user@serandives.com');
            request({
                uri: pot.resolve('/apis/v/tokens'),
                method: 'POST',
                json: {
                    client_id: '',
                    grant_type: 'password',
                    username: 'user@serandives.com',
                    password: '1@2.Com'
                }
            });
            done();
        });
    });
});