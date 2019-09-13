var log = require('logger')('accounts');
var nconf = require('nconf');
var bodyParser = require('body-parser');
var serand = require('serand');
var dust = require('dustjs-linkedin');

var errors = require('errors');
var utils = require('utils');
var serandi = require('serandi');

var domain = 'accounts';
var version = nconf.get('INDEX_' + domain.toUpperCase());
var server = utils.serverUrl();
var subdomain = utils.subdomain();
var cdn = nconf.get('CDN_STATICS');
var captchaKey = nconf.get('CAPTCHA_KEY');
var googleKey = nconf.get('GOOGLE_KEY');
var adsense = nconf.get('GOOGLE_ADSENSE');

module.exports = function (router, done) {

  router.use(bodyParser.urlencoded({extended: true}));

  serand.index(domain, version, function (err, index) {
    if (err) {
      return done(err);
    }
    dust.loadSource(dust.compile(index, domain));
    serand.configs(['boot', 'groups'], function (err, configs) {
      if (err) {
        return done(err);
      }
      //index page with embedded oauth tokens
      router.all('/auth', function (req, res) {
        var context = {
          cdn: cdn,
          version: version,
          googleKey: googleKey,
          server: server,
          subdomain: subdomain,
          configs: configs,
          captchaKey: captchaKey,
          code: req.body.code || req.query.code,
          error: req.body.error || req.query.error,
          errorCode: req.body.error_code || req.query.error_code
        };
        //TODO: check caching headers
        dust.render(domain, context, function (err, index) {
          if (err) {
            log.error('dust:render', err);
            return res.pond(errors.serverError());
          }
          res.set('Content-Type', 'text/html').status(200).send(index);
        });
      });
      router.all('/auth/oauth', function (req, res) {
        var context = {
          cdn: cdn,
          version: version,
          adsense: adsense,
          googleKey: googleKey,
          server: server,
          subdomain: subdomain,
          configs: configs,
          captchaKey: captchaKey,
          code: req.body.code || req.query.code,
          error: req.body.error || req.query.error,
          errorCode: req.body.error_code || req.query.error_code
        };
        //TODO: check caching headers
        dust.render(domain, context, function (err, index) {
          if (err) {
            log.error('dust:render', err);
            return res.pond(errors.serverError());
          }
          res.set('Content-Type', 'text/html').status(200).send(index);
        });
      });
      router.use('/apis/*', serandi.notFound);
      //index page
      router.all('*', function (req, res) {
        //TODO: check caching headers
        var context = {
          cdn: cdn,
          version: version,
          adsense: adsense,
          googleKey: googleKey,
          server: server,
          subdomain: subdomain,
          configs: configs,
          captchaKey: captchaKey
        };
        //TODO: check caching headers
        dust.render(domain, context, function (err, index) {
          if (err) {
            log.error('dust:render', err);
            return res.pond(errors.serverError());
          }
          res.set('Content-Type', 'text/html').status(200).send(index);
        });
      });

      done();
    });
  });
};
