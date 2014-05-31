/*
 * feathers-waterline-blueprints
 *
 * Copyright (c) 2014 Kevin Smith
 * Licensed under the MIT license.
 */

'use strict';

var diskAdapter = require('sails-disk');
var async       = require('async');
var _           = require('lodash');
var create      = require('./create');
var path        = require('path');
var fs          = require('fs');

var defaults = {

    modelsPath   : path.join(path.dirname(require.main.filename), 'models'),
    servicesPath : path.join(path.dirname(require.main.filename), 'services'),

    waterline : {

        adapters : {
            'default' : diskAdapter,
            disk      : diskAdapter
        },

        connections : {

            'default' : {
                adapter : 'disk'
            }

        },

        defaults : {
            migrate : 'alter'
        }

    }

};

module.exports = {

    create : create,

    api : function (config) {

        if (!config) {
            config = {};
        }

        config = _.defaults(defaults, config);

        return function() {

            var app = this;

            app.enable('feathers waterline-blueprints');

            async.auto({

                orm : function (autoCallback) {

                    var ORM = require('./orm');
                    new ORM(config.modelsPath, config.waterline, autoCallback);

                },

                services : ['orm', function (autoCallback, results) {

                    var orm = app.orm = results.orm;

                    for (var collectionName in app.orm.collections) {

                        var servicePath = path.join(config.servicesPath, collectionName);
                        var Service;
                        var serviceName;

                        if (fs.existsSync(servicePath + '.js')) {
                            Service = require(servicePath);
                        } else {
                            serviceName = collectionName.charAt(0).toUpperCase() + collectionName.slice(1);
                            Service     = create(serviceName);
                        }

                        var service = new Service();

                        service.collection = orm.collections[collectionName];

                        // seems to be a bug in feathers
                        // setup should be called automatically
                        if (service.setup) {
                            service.setup(app);
                        }

                        app.use('/' + collectionName, service);

                    }

                    autoCallback(null);

                }]


            }, function (err) {

                if (err) {
                    return console.error(err);
                }

            });

        };

    }

};
