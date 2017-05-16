var log = require('logger')('accounts');
var nconf = require('nconf');
var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var locate = require('locate');
var auth = require('auth');
var serandi = require('serandi');
var serand = require('serand');
var dust = require('dustjs-linkedin');

var domain = 'accounts';
var version = nconf.get('clients')[domain];
var server = nconf.get('server');
var cdn = nconf.get('cdn');

var app = express();

auth = auth({
    open: [
        '^(?!\\/apis(\\/|$)).+',
        '^\/apis\/v\/configs\/boot$',
        '^\/apis\/v\/tokens$'
    ],
    hybrid: [
        '^\/apis\/v\/menus\/.*',
        '^\/apis\/v\/users([\/].*|$)',
        '^\/apis\/v\/tokens\/.*'
    ]
});

module.exports = function (done) {
    serand.index(domain, version, function (err, index) {
        if (err) {
            throw err;
        }

        dust.loadSource(dust.compile(index, domain));

        app.use(locate('/apis/v'));
        app.use(serandi.ctx);
        app.use(auth);

        app.use(bodyParser.urlencoded({
            extended: true
        }));

        app.use(bodyParser.json());

        app.use('/apis/v', require('config-service'));
        app.use('/apis/v', require('user-service'));
        app.use('/apis/v', require('client-service'));
        app.use('/apis/v', require('token-service'));
        app.use('/apis/v', require('menu-service'));

        //index page with embedded oauth tokens
        app.all('/auth/oauth', function (req, res) {
            var context = {
                server: server,
                cdn: cdn,
                version: version,
                code: req.body.code || req.query.code,
                error: req.body.error || req.query.error,
                errorCode: req.body.error_code || req.query.error_code
            };
            //TODO: check caching headers
            dust.render(domain, context, function (err, index) {
                if (err) {
                    log.error(err);
                    res.status(500).send({
                        error: 'error rendering requested page'
                    });
                    return;
                }
                res.set('Content-Type', 'text/html').status(200).send(index);
            });
        });
        //index page
        app.all('*', function (req, res) {
            //TODO: check caching headers
            var context = {
                server: server,
                cdn: cdn,
                version: version
            };
            //TODO: check caching headers
            dust.render(domain, context, function (err, index) {
                if (err) {
                    log.error(err);
                    res.status(500).send({
                        error: 'error rendering requested page'
                    });
                    return;
                }
                res.set('Content-Type', 'text/html').status(200).send(index);
            });
        });

        //error handling
        //app.use(agent.error);
        done(null, app);
    });
};