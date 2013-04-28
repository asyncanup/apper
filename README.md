apper
=====

Plug and play, convention based, restful app development in node.js


Install
-------

`npm install apper`


Usage
-----

### server.js

    var app = require("apper")();

    if (app.init()) {
        app.start(8000);
    }

Example directory structure
-------

  - root/
    - **server.js**: *shown above*
    - **environment.js**
    - **middleware.js**
    - **routes.js**: GET /, GET /buddy

    - subapp1/
      - **routes.js**: GET /, POST /

    - subapp2/
      - **middleware.js**
      - **routes.js**: GET /

      - subapp3/
        - **routes.js**: GET /, GET /last

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

### routes.js

    module.exports = function (app, mountPath) {
        app.get("/", function (req, res, next) { res.send("hey"); });
    }

### middleware.js

    module.exports = function (app, mountPath) {
        app.use(function (req, res, next) { next(); });
    }

### environment.js

    module.exports = function (app, mountPath) {
        app.set("property", "value");
    }


And guess what
---------

Every subapp is a complete node.js app unto itself.

It can have a package.json, its dependencies are respected,
it can be pulled out and placed anywhere in the overall directory structure,
or even used as a separated app (that's the whole point, actually).

The rest api is entirely based on the directory structure, on what app lies where.
