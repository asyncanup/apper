Apper
=====


Plug and play, restful, real-time application framework for single page apps.

[![Build Status on Travis CI](https://api.travis-ci.org/asyncanup/apper.png)](https://travis-ci.org/asyncanup/apper "Build Status on Travis CI")
[![NPM Latest version](http://badge.fury.io/js/apper.png)](http://badge.fury.io/js/apper "NPM Latest Version")

[![Join the chat at https://gitter.im/asyncanup/apper](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/asyncanup/apper?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

App
---

A regular directory becomes a valid app if it has one or more of the following:

* An environment settings module with the name `environment.js`
* A middleware module with the name `middleware.js`
* A socket subscription module with the name `sockets.js`
* A static content directory with the name `public`
* A routes module with the name `routes.js`

All of the default file/directory names above can be changed by options in 
`apper.json` file in any directory.


Install
-------

For usage as command-line tool:

```bash
$ npm install -g apper
```

For usage in code:

```bash
$ npm install apper
```


Usage
-----

### From command-line

Just open the shell (or command prompt) in the app directory
(with one or more of the above-mentioned files), and run:

```bash
$ apper
```

And open `http://localhost:8000` in browser.

Run `apper -h` for all the command-line options.

A more specific deployment might look like:

```bash
$ apper --port 8080 --address 127.0.0.0 code/src
```

Here, `code/src` is the root path of the application code, relative to current
directory from which `apper` is run. It defaults to the current directory itself.

To display internal logs during development (helpful), just set `DEBUG` environment
variable to `apper:*`

```bash
$ DEBUG=apper:* apper --port 8000
```

For a working example, check out `test/sample` which is used by the tests.
Just run `apper` in the shell there and read the tests to get a better understanding.


Motivation
----------

[Express] [5] isn't enough. It lacks structure and conventions.

Apper provides:

- Much needed **structure** to server-side code with strong conventions
- Reliable **directory hierarchy** for code based on REST end-points
- Design for **real-time** right off the bat
- Transparent **minification & bundling** for single page apps

The core idea of `apper` is to enable easy REST api based node.js apps, especially 
useful for Single Page Applications.

Apper lets you create bigger apps by using smaller independent chunks as subapps.
Simply place individual subapps anywhere in the directory hierarchy, and they get
exposed under a relative base URL.

Nested subapps are totally cool and highly encouraged.
In fact, simply by moving a subapp directory to another directory updates the exposed 
relative URL of that subapp. No frills.


Example
-------

### Example directory structure

```
+ root/
    - server.js (See Programmatic Usage section below)
    - routes.js (GET /login)
    + public/
        - index.html
        - main.js

    + api/
        - routes.js (GET /, POST /)
    
        + items/
            - middleware.js
            - routes.js (GET /, GET /last)
```

*routes.js* files above are supposed to specify route handlers for paths mentioned
against them.

Read below for code samples for all of them.

### API exposed by the directory structure above

```
GET  /
GET  /login

GET  /api
POST /api

GET  /api/items
GET  /api/items/last
```

The route `/` serves `index.html` in `public/` by default.
Can be overridden by including a route `GET /` in `routes.js`.


Core Concepts
-------------

#### Order of initialization of modules

The following modules get initialized on the subapp in order:

* `environment.js` to set environment settings using `app.set` (like Express)
* `middleware.js` to setup middleware functions using `app.use` (like Express)
* `sockets.js` to setup WebSocket subscriptions between server and client
* `public` exposed as static content directory
* `routes.js` to respond to URL end-points (using `app.get`, `app.post`, etc.)


### Bigger apps composed of small apps

The root app can contain sub-directories which are complete apps unto themselves. 
These directories become subapps of the root app (or sub APIs, if you may).

Subapps can be pulled out and placed anywhere in the overall directory structure.
This would make them available on the new relative url with respect to the root.

Every subapp directory can be started as a separated app just by running `apper` in there.

Due to the directory hierarchy based mounting of subapps, the base URL paths of
all subapps are decided by their position in the directory hierarchy.

The subapps can then register for any relative URL route after their base URL and
handle requests accordingly.


Programmatic Usage
------------------

### As a module

Create a file (say, `server.js`) in your application directory

```js
var app = require('apper')({
    port: 8000
});
app.start();
```

Then, running `server.js` will start the application on port 8000. For example:

```bash
$ node server.js
```

To see internal logs (helpful during development), just set the environment variable `DEBUG` as follows:

```bash
$ DEBUG=apper:* node server.js
```


### As Express application

Create an application object as usual, and use `app.expressApp` as a regular express application

```js
var app = require('apper')();
app.expressApp.listen(5000);
```

### As Express middleware

You can use this application as middleware in your regular express app as follows:

```js
var app = require('apper')();
myExpressApp.use(app.expressApp);
```

Mounting your **apper** app as an Express subapp is as easy:

```js
var app = require('apper')();
myExpressApp.use('/blog', app.expressApp);
```

Now the **apper** application gets confined to `/blog` base URL.


More Code
---------

### Startup

Apper synchronously loads its modules when you initialize it. You can start the
server by calling `app.start()`.

Constructor options look like this:

```js
var app = require('apper')({
    path: '.',
    port: 8000,
    host: '0.0.0.0',
    
    // Not commonly used. Just use `apper.json` for the configuration
    toOpenBrowser: false,
    staticDir: 'public',
    moduleNames: {
        environment: 'environment'
        middleware: 'middleware',
        routes: 'routes',
        sockets: 'sockets'
    },
    mountPath: ''
});
app.start();
```

The default values for the options (path/port/etc) are as shown above.
The options mean the following:

- `path`: Path for the directory to be taken as the root application.
- `port`: Port number on which to expose the application.
- `host`: Host name to be used for the application (`127.0.0.1`, `localhost`, `0.0.0.0`, etc).
- `toOpenBrowser`: Whether to open the system default browser with the created application.
- `staticDir`: Name of the static content directory.
- `moduleNames.*`: As discussed below in Structure of Modules.
- `mountPath`: Base URL to mount this application on. Used internally for mounting subapps.

Server automatically starts a single socket.io WebSocket server that works across all subapps
but maintains separate namespaces for all communication with different subapps.


### Structure of modules

Get an Express-based app object and run express methods like 
`app.set`, `app.use`, `app.get`, `app.post`, etc. on it.

For WebSocket requests, `app.sockets` provides the same functionality as
`io.sockets` using [socket.io] [6]

#### environment.js

```js
module.exports = function (app) {
    app.set('property', 'value');
    // Environment configuration
};
```

#### middleware.js

```js
module.exports = function (app) {
    
    app.use(function (req, res, next) {
        // middleware code
        next();
    });
};
```

#### routes.js

```js
module.exports = function (app) {
    
    app.get('/', function (req, res) {
        res.send('hey');
    });
};
```
 
#### sockets.js

```js
module.exports = function (app) {
    app.sockets.on('connection', function (socket) {
        
        socket.on('hey', function (name) {
            socket.emit('Hey ' + name + '!');
        });
        
    }
};
```

#### Client-side socket code

Client-side code corresponding to `sockets.js` looks as simple.

Just include `<script src='/socket.io/socket.io.js'></script>` in `public/index.html`,
and connect to the socket server like this:

```js
var socket = io();

socket.on('connect', function () {
    alert('woohoo!');
});
```

A subapp client connects by default to its own namespace, as per its directory hierarchy.
So you won't have 2 different subapps catching each others socket events.


Configuration
-------------

`apper.json` placed in root or any subapp directory controls the following
configuration for the respective app:

* `moduleNames.environment` (Example: _'env'_)
  
  Environment module file name for the current app

* `moduleNames.middleware` (Example: _'mid'_)
  
  Middleware module file name for the current app

* `moduleNames.sockets` (Example: _'sock'_)
  
  Socket subscriptions module for the current app

* `moduleNames.routes` (Example: _'route-definitions'_)
  
  Routes module file name for the current app

* `staticDir` (Example: _'www'_)
  
  Static content directory name for the current app.

* `dirToIgnore` (Example: _['subapp', 'another']_)
  
  List of directories to not consider as subapps in the current app's directory.

* `bundle` (Example: _true_/_false_)
  
  Whether to transparently minify and inline all JavaScript and CSS resources, 
  including RequireJS modules. Cached on first use, and served as is thereon.
  
  You can include `require-config.js` in RequireJS `baseUrl` directory to specify
  custom RequireJS options for bundling. Usually not required.


### Sample `apper.json` configuration file

```
{
    "moduleNames: {
        "environment": "env",
        "middleware": "mid",
        "sockets": "sock",
        "routes": "route-definitions"
    },
    "staticDir": "www",
    "dirToIgnore": ["subapp", "another"],
    "bundle": true
}
```


Tests
-----

To run tests yourself, install `mocha`

```bash
$ npm install
$ npm install -g mocha
```

In the project directory, run

```bash
$ npm test
```

Check out the `test` directory for usage examples.


License
-------

MIT


[5]: http://expressjs.com "Express.js"
[6]: http://socket.io/ "Socket.io"
[7]: https://coveralls.io/repos/asyncanup/apper/badge.png
[8]: https://coveralls.io/r/asyncanup/apper "Coveralls Coverage Status"
[9]: https://github.com/visionmedia/debug "Debug module on NPM"
