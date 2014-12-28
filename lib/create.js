/*
 * feathers-blueprints
 *
 * Copyright (c) 2014 Kevin Smith
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');

function ParamParser() {}

ParamParser.prototype.parse = function (params) {

    if (!params.query) {
        params.query = {};
    }

    var parseQuery = function (params) {
        var query = _.clone(params.query);
        delete query.limit;
        delete query.sort;
        delete query.skip;
        return query;
    };

    var parseLimit = function (params) {
        return parseInt(params.query.limit, 10) || undefined;
    };

    var parseSort  = function (params) {
        return params.query.sort;
    };

    var parseSkip  = function (params) {
        return parseInt(params.query.skip, 10) || undefined;
    };

    return {
        query : parseQuery(params),
        limit : parseLimit(params),
        sort  : parseSort(params),
        skip  : parseSkip(params)
    };

};

var paramParser = new ParamParser();

function Blueprint() {}

Blueprint.prototype = {

    find : function (params, callback) {

        var parsedParams = paramParser.parse(params);
        var query        = this.collection.find();

        if (parsedParams.query) {
            query.where(parsedParams.query);
        }

        if (parsedParams.limit) {
            query.limit(parsedParams.limit);
        }

        if (parsedParams.sort) {
            query.sort(parsedParams.sort);
        }

        if (parsedParams.skip) {
            query.skip(parsedParams.skip);
        }

        _.map(this.collection._attributes, function (attribute, key) {
            return (attribute.collection || attribute.model) ? key : null;
        }).filter(function (attributeKey) {
            return attributeKey !== null;
        }).reduce(function (query, association) {
            return query.populate(association);
        }, query);

        query.exec(callback);

    },

    get : function (id, params, callback) {
        var parsedQuery = paramParser.parse(params).query;
        var criteria    = _.merge({ id : id }, parsedQuery);
        var query       = this.collection.findOne(criteria);

        _.map(this.collection._attributes, function (attribute, key) {
            return (attribute.collection || attribute.model) ? key : null;
        }).filter(function (attributeKey) {
            return attributeKey !== null;
        }).reduce(function (query, association) {
            return query.populate(association);
        }, query);

        query.exec(callback);
    },

    create : function (data, params, callback) {
        this.collection.create(data, callback);
    },

    update : function (id, data, params, callback) {
        var query    = paramParser.parse(params).query;
        var criteria = _.merge({ id : id }, query);

        this.collection.update(criteria, data, function (err, result) {

            if (err || result.length === 0) {
                return callback();
            }

            callback(null, result[0]);

        });
    },

    remove : function (id, params, callback) {
        var query    = paramParser.parse(params).query;
        var criteria = _.merge({ id : id }, query);

        this.collection.destroy(criteria, function (err, result) {

            if (err || result.length === 0) {
                return callback(err);
            }

            callback(null, result[0]);

        });
    }

};

module.exports = function (serviceName) {

    var Constructor = new Function('return function ' + serviceName + 'Service() {}')();

    Constructor.prototype = new Blueprint();

    return Constructor;

};
