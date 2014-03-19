var assert = require("assert"),
    path = require("path");

describe("fs-utils", function () {
    describe(".subAppNames", function () {
        it(
            "should skip directories to ignore " +
                "passed as argument, listed in apper.json, and in apper defaults",
            function () {
                var fsUtils = require("../lib/fs-utils");
    
                var app = require("../")({
                    path: path.join(__dirname, "sample"),
                    dirToIgnore: ["subapp3"]
                });
                
                assert.deepEqual(fsUtils.subAppNames(app), ["subapp"]);
            }
        );
    });
});
