var log = require('logger')('accounts');
var nconf = require('nconf');
var bodyParser = require('body-parser');
var serand = require('serand');
var dust = require('dustjs-linkedin');
var errors = require('errors');

var domain = 'accounts';
var version = nconf.get('clients')[domain];
var server = nconf.get('server');
var cdn = nconf.get('cdn');

module.exports = function (router) {
    router.use(bodyParser.urlencoded({extended: true}));

    serand.index(domain, version, function (err, index) {
        if (err) {
            throw err;
        }
        dust.loadSource(dust.compile(index, domain));
        //index page with embedded oauth tokens
        router.all('/auth/oauth', function (req, res) {
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
                    return res.pond(errors.serverError());
                }
                res.set('Content-Type', 'text/html').status(200).send(index);
            });
        });
        //index page
        router.all('*', function (req, res) {
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
                    return res.pond(errors.serverError());
                }
                res.set('Content-Type', 'text/html').status(200).send(index);
            });
        });
    });
};