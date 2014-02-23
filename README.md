apper
=====

Plug and play, restful, real-time, lean app development in node.js


Install
-------

`npm install apper`


Idea
----

The core idea of `apper` is to enable easy REST api based node.js apps, by
letting you place individual subapps simply in the required directory hierarchy.

Moving a subapp directory just changes its relative URL from the base app.


### Example directory structure

  - *root/*
    - **server.js**: *see _Usage_ section below*
    - **routes.js**: GET /list
    - *public/*
      - **index.html**

    - *subapp/*
      - **routes.js**: GET /, POST /

      - *subsubapp/*
        - > **middleware.js**
        - > **routes.js**: GET /, GET /last


### API exposed

* GET  /        _(serves index.html)_
* GET  /list

* GET  /subapp
* POST /subapp

* GET  /subapp/subsubapp
* GET  /subapp/subsubapp/last


Concepts
---------


### Bigger apps composed of small apps

Every subapp is a complete node.js app unto itself (without being listened on).

It can be pulled out and placed anywhere in the overall directory structure,
to make it available on that relative url with respect to the root.

Every subapp folder can be used as a separated app.
Hence, the rest api exposed by the apps is based on the directory structure and 
placement of the apps.


### What makes a subapp?

A regular folder becomes a valid subapp if it has one of the following:

* An environment settings module with the name `environment.js`
  (can be changed by options passed or `moduleNames.environment` property in `apper.json`)
* A middleware module with the name `middleware.js`
  (can be changed by options passed or `moduleNames.middleware` property in `apper.json`)
* A static content folder with the name `public`
  (can be changed by options passed or `staticContentPath` property in `apper.json`)
* A routes module with the name `routes.js`
  (can be changed by options passed or `moduleNames.routes` property in `apper.json`)


### Order of initialization

The following things get initialized on the subapp in order:

* Environment module gets loaded to set environment settings using `app.set` 
* Middleware module gets loaded to setup middleware functions using `app.use`
* Static content folder gets exposed on subapp's url
  (the folder hierarchy containing the subapp)
* Routes get loaded that respond to paths _other_ than those found in static
  content.


Usage
-----

### server.js

    var app = require("apper")();

    app.init() && app.start();

It automatically starts a WebSocket server using `socket.io`
which can be used on the client by including `/socket.io/socket.io.js` in HTML.

You may want to include `server.js` in subapps as well, just to be able to go
into that directory and start that subapp as the root app.


### Structure of modules

Get an Express-based app object and run express methods like 
`app.set`, `app.use`, `app.get`, `app.post`, etc. on it.

#### environment.js

    module.exports = function (app) {
        app.set("property", "value");
    }

#### middleware.js

    module.exports = function (app) {
        app.use(function (req, res, next) {
            next();
        });
    }

#### routes.js

    module.exports = function (app) {
        app.get("/", function (req, res) {
            res.send("hey");
        });
    }


Configuration
-------------

`apper.json` placed in root or any subapp directory controls the following
configuration for the respective app:
* `moduleNames`
  * `environment`
    Environment module file name for the current app (omit `.js`)
  * `middleware`
    Middleware module file name for the current app (omit `.js`)
  * `routes`
    Routes module file name for the current app (omit `.js`)
* `staticContentPath`
  Static content directory name for the current app
* `dirToIgnore`
  List of directories to not consider as subapps in the current app's directory


Tests
-----

Install `mocha`

    npm install -g mocha

In the project directory, run

    mocha


License
-------

MIT







