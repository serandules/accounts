var User = require('user');
var Client = require('client');

var email = 'admin@serandives.com';

var client = 'serandives.com';

var initialize = function (done) {
    User.findOne({
        email: email
    }).exec(function (err, user) {
        if (err) {
            return done(err);
        }
        if (user) {
            return done();
        }

        var suPass = process.env.SU_PASS;
        if (!suPass) {
            return done('su password cannot be found. Please specify it using SU_PASS');
        }

        user = {
            email: email,
            password: suPass,
            permissions: {
                '*': {
                    '': ['*']
                }
            }
        };

        User.create(user, function (err, user) {
            if (err) {
                return done(err);
            }

            Client.create({
                name: client,
                user: user
            }, function (err, client) {
                if (err) {
                    return done(err);
                }
                done();
            });
        });
    });
};

module.exports = initialize;