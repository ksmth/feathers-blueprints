var Waterline   = require('waterline');
var fs          = require('fs');
var path        = require('path');

function ORM(modelsPath, waterlineConfig, callback) {

    init.call(this, modelsPath, waterlineConfig, callback);

}

function init(modelsPath, waterlineConfig, callback) {

    this.waterline = new Waterline();

    var handleModelFile = function (err, files) {

        if (err) {
            return callback(err);
        }

        files.filter(filterHiddenAndIndex).forEach(createCollectionByFilename);

        this.waterline.initialize(waterlineConfig, waterlineInitHandler);

    }.bind(this);

    var filterHiddenAndIndex = function (file) {

        return (file.indexOf('.') !== 0);

    };

    var createCollectionByFilename = function (file) {

        var collectionName   = file.replace('.js', '');
        var collectionConfig = require(path.join(modelsPath, file));

        createCollection(collectionName, collectionConfig);

    }.bind(this);

    var createCollection = function (collectionName, collectionConfig) {

        if (!collectionConfig.identity) {
            collectionConfig.identity = collectionName;
        }

        if (!collectionConfig.connection) {
            collectionConfig.connection = 'default';
        }

        var model = Waterline.Collection.extend(collectionConfig);
        this.waterline.loadCollection(model);

    }.bind(this);

    var waterlineInitHandler = function (err, models) {

        if (err) {
            return callback(err);
        }

        this.collections = models.collections;
        this.connections = models.connections;

        callback(null, this);

    }.bind(this);

    fs.readdir(modelsPath, handleModelFile);

}

module.exports = ORM;
