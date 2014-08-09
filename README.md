Apper Docs
==========

Plug and play, restful, real-time single page apps framework

[![Build Status on Travis CI] [1]] [2]
[![NPM Latest version] [3]] [4]

Install
-------

For usage as command-line tool:

    npm install -g apper


For usage in code:

    npm install apper


Command-line usage
------------------

Just open the command prompt in a directory with server-side code as described below, and run:

    apper --port 8000 --address 0.0.0.0 ./src
    
Here, `./src` is the root path of the application code.
It defaults to the current directory from which `apper` is run.

Port and address are optional and default to shown values.


Idea
----

[Express] [5] isn't enough. It lacks structure and conventions.

Apper provides:

- Much needed **structure** to server-side code with strong conventions
- Reliable **folder hierarchy** for code based on REST end-points
- Design for **real-time** right off the bat
- Transparent **minification & bundling** for single page apps

The core idea of `apper` is to enable easy REST api based node.js apps, especially 
useful for Single Page Applications.

Apper lets you create bigger apps by using smaller independent chunks as subapps.
Simply place individual subapps anywhere in the directory hierarchy, and they get
exposed under a relative base URL.

Nested subapps are totally cool and highly encouraged.
In fact, simply by moving a subapp directory to another folder updates the exposed 
relative URL of that subapp. No frills.


### Example directory structure

  - root/
    - **server.js**: See *Usage* section below
    - **routes.js**: GET /list
    - **public/**
      - *index.html*
      - *main.js*

    - **subapp/**
      - *routes.js*: GET /, POST /

      - **subsubapp/**
        - *middleware.js*
        - *routes.js*: GET /, GET /last

Marked *routes.js* files are supposed to specify route handlers for paths mentioned
against them.


### API exposed by the directory structure above

    GET  /
    GET  /list
    
    GET  /subapp
    POST /subapp
    
    GET  /subapp/subsubapp
    GET  /subapp/subsubapp/last

The route `/` serves `index.html` in `public/` by default.


Concepts
---------

### What makes an app?

A regular folder becomes a valid app if it has one or more of the following:

* An environment settings module with the name `environment.js`
* A middleware module with the name `middleware.js`
* A socket subscription module with the name `sockets.js`
* A static content folder with the name `public`
* A routes module with the name `routes.js`

All of the default file/folder names above can be changed by options in 
`apper.json` file in any folder.


#### Order of initialization of above-mentioned modules

The following things get initialized on the subapp in order:

* Environment module gets loaded to set environment settings using `app.set` (like Express)
* Middleware module gets loaded to setup middleware functions using `app.use` (like Express)
* Sockets module gets loaded to setup WebSocket subscriptions between server and client 
* Static content folder gets exposed on subapp's url
  (the folder hierarchy containing the subapp)
* Routes get loaded that respond to URL end-points (using `app.get`, `app.post`, etc.)


### Bigger apps composed of small apps

The root app can contain sub-directories which are complete apps unto themselves. 
These directories become subapps of the root app.

Subapps can be pulled out and placed anywhere in the overall directory structure.
This would make them available on the new relative url with respect to the root.

Every subapp folder can be started as a separated app by including `server.js` in there.

Due to the directory hierarchy based mounting of subapps, the base URL paths of
all subapps are decided by their position in the directory hierarchy.

The subapps can then register for any relative URL route after their base URL and
handle requests accordingly.


Usage
-----

### server.js

    var app = require("apper")();
    app.start();

It automatically loads the modules mentioned above and starts a server.

You could provide options like:

    var app = require("apper")({
        path: ".",
        port: 8000,
        host: "0.0.0.0"
    });
    app.start();

The options mean the following:
- path

Server automatically listens to WebSocket requests (using `socket.io`).
Include `<script src='/socket.io/socket.io.js'></script>` in HTML for use on client-side.


### Structure of modules

Get an Express-based app object and run express methods like 
`app.set`, `app.use`, `app.get`, `app.post`, etc. on it.

For WebSocket requests, `app.sockets` provides the same functionality as
`io.sockets` using [socket.io] [

#### environment.js

    module.exports = function (app) {
        app.set("property", "value");
        // Environment configuration
    };

#### middleware.js

    module.exports = function (app) {
        
        app.use(function (req, res, next) {
            // middleware code
            next();
        });
    };
    
#### sockets.js

    module.exports = function (app) {
        app.sockets.on("connection", function (socket) {
            
            socket.on("hey", function (name) {
                socket.emit("Hey " + name + "!");
            });
            
        }
    };

#### routes.js

    module.exports = function (app) {
        
        app.get("/", function (req, res) {
            res.send("hey");
        });
    };


Configuration
-------------

`apper.json` placed in root or any subapp directory controls the following
configuration for the respective app:

* `moduleNames.environment` (Example: _"env"_)
  
  Environment module file name for the current app

* `moduleNames.middleware` (Example: _"mid"_)
  
  Middleware module file name for the current app

* `moduleNames.sockets` (Example: _"sock"_)
  
  Socket subscriptions module for the current app

* `moduleNames.routes` (Example: _"route-definitions"_)
  
  Routes module file name for the current app

* `staticContentPath` (Example: _"www"_)
  
  Static content directory name for the current app.

* `dirToIgnore` (Example: _["subapp", "another"]_)
  
  List of directories to not consider as subapps in the current app's directory.

* `bundle` (Example: _true_/_false_)
  
  Whether to transparently minify and inline all JavaScript and CSS resources, 
  including RequireJS modules. Cached on first use, and served as is thereon.
  
  You can include `require-config.js` in RequireJS `baseUrl` directory to have
  this bundling respecting options other than those for async loading. 
  Usually not required.


### Sample `apper.json`

    {
        "moduleNames: {
            "environment": "env",
            "middleware": "mid",
            "sockets": "sock",
            "routes": "route-definitions"
        },
        "staticContentPath": "www",
        "dirToIgnore": ["subapp", "another"],
        "bundle": true
    }


Tests
-----

To run tests yourself, install `mocha`

    npm install
    npm install -g mocha

In the project directory, run

    npm test

Check out the `test` directory for usage examples.


License
-------

MIT


[1]: https://api.travis-ci.org/anupbishnoi/apper.png
[2]: https://travis-ci.org/anupbishnoi/apper "Build Status on Travis CI"
[3]: https://badge.fury.io/js/apper.png
[4]: http://badge.fury.io/js/apper "NPM Latest Version"
[5]: http://expressjs.com "Express.js"
[6]: http://socket.io/ "Socket.io"