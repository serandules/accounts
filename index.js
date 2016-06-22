var log = require('logger')('accounts-services');
var nconf = require('nconf').argv().env();
var http = require('http');
var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var auth = require('auth');
var serandi = require('serandi');

var mongourl = nconf.get('MONGODB_URI');

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

mongoose.connect(mongourl);

var db = mongoose.connection;
db.on('error', function (err) {
    log.error(err);
});
db.once('open', function () {
    log.info('connected to mongodb');

    app.use(serandi.ctx)
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

    //error handling
    //app.use(agent.error);

    var server = http.createServer(app);
    server.listen(0);
});

process.on('uncaughtException', function (err) {
    log.debug('unhandled exception ' + err);
    log.debug(err.stack);
    process.exit(1);
});