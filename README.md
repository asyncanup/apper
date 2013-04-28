apper
=====

Plug and play, convention based, restful app development in node.js


## Install

`npm install apper`


## Usage

Example directory structure
-------
  - root
    o environment.js
    o middleware.js
    o routes.js: GET /, GET /buddy

    o subapp1
      - routes.js: GET /, POST /

    o subapp2
      - middleware.js
      - routes.js: GET /

      - subapp3
        o routes.js: GET /, GET /last

Routes exposed by the structure above
------

* GET  /
* GET  /buddy

* GET  /subapp1
* POST /subapp1

* GET  /subapp1/subapp2

* GET  /subapp1/subapp2/subapp3
* GET  /subapp1/subapp2/subapp3/last


Structure of routes.js, environment.js, middleware.js
---------

## routes.js

    module.exports = function (app, mountPath) {
        app.get("/", function (req, res, next) { res.send("hey"); });
    }

## middleware.js

    module.exports = function (app, mountPath) {
        app.use(function (req, res, next) { next(); });
    }

## environment.js

    module.exports = function (app, mountPath) {
        app.set("property", "value");
    }


And guess what
---------

Every subapp is a complete node.js app unto itself.

It can have a package.json, its dependencies are respected,
it can be pulled out and placed anywhere in the overall directory structure.

The rest api is entirely based on the directory structure, and what app lies where.
