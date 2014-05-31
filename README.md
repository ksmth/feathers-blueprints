# feathers-blueprints

> Add some of the Sails.js blueprints functionality to Feathers.

## Getting Started

To install feathers-blueprints from [npm](https://www.npmjs.org/), run:

```bash
$ npm install feathers-blueprints --save
```

Finally, to use the plugin in your Feathers app:

```javascript
var feathers   = require('feathers');
var blueprints = require('feathers-blueprints');
var app        = feathers();
// Use Blueprints
app.configure(blueprints.api(function () {
    app.listen(8080)
}));
```

__IMPORTANT:__ Make sure to call `app.listen` _after_ the callback of `blueprints.api(config, callback)` has been called. Otherwise the Services won't be setup properly and the socket connections will not work.

## Documentation

By default, the blueprints assume a folder structure like this:

```
.
├── models/
│   ├── messages.js
│   └── users.js
├── node_modules/
├── services/
│   └── users.js
└── app.js
```

For each model definition inside `/models` a blueprint will be created if a corresponding service does not exist in `/services`.

### Configuration

You can override the paths for the model and service lookup and also provide your own `Waterline` configuration.

```JavaScript
var diskAdapter  = require('sails-disk');
var mysqlAdapter = require('sails-mysql');

app.configure(blueprints.api({

    modelsPath   : '/path/to/models/directory',
    servicesPath : '/path/to/services/directory',
    waterline    : {

        adapters: {
            'default' : diskAdapter,
            disk      : diskAdapter,
            mysql     : mysqlAdapter
        },

        connections: {
            disk : {
                adapter : 'disk'
            },

            mysql : {
                adapter  : 'mysql',
                host     : 'localhost',
                database : 'foobar'
            }
        },

        defaults : {
            migrate : 'alter'
        }
    };

}, function () {
    app.listen(8080);
}));
```

### Override blueprints

To override or modify a blueprint, create a file with the same name inside the `/services` folder. The backing `Waterline.Collection` is accessible through `this.collection` inside a service. You can use the blueprints as a starting point:

```JavaScript
// 'services/users.js'
var blueprints = require('feathers-blueprints');

var UsersService = blueprints.create('Users');

UsersService.prototype.create = function (data, params, callback) {
    // do custom stuff
};

module.exports = UsersService;
```

## Author

- [Kevin Smith](https://github.com/ksmth)

## License

Copyright (c) 2014 Kevin Smith

Licensed under the [MIT license](LICENSE).
