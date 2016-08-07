var log = require('logger')('accounts');
var nconf = require('nconf');
var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var auth = require('auth');
var serandi = require('serandi');
var serand = require('serand');
var dust = require('dustjs-linkedin');

var client = 'accounts';
var version = nconf.get('ACCOUNTS_CLIENT');

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
    serand.index(client, version, function (err, index) {
        if (err) {
            throw err;
        }

        dust.loadSource(dust.compile(index, client));

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
                version: version,
                code: req.body.code || req.query.code,
                error: req.body.error || req.query.error,
                errorCode: req.body.error_code || req.query.error_code
            };
            //TODO: check caching headers
            dust.render(client, context, function (err, index) {
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
                version: version
            };
            //TODO: check caching headers
            dust.render(client, context, function (err, index) {
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