var assert = require("assert"),
    apper = require("../"),
    fsUtils = require("../lib/fs-utils");
    
describe("fs-utils", function () {
    var app = apper({
        path: require("path").join(__dirname, "sample"),
        dirToIgnore: ["subapp3"]
    });
    
    describe(".subAppNames", function () {
        it(
            "should skip directories to ignore " +
                "passed as argument, listed in apper.json, and in apper defaults",
            function () {
                assert.deepEqual(fsUtils.subAppNames(app), ["subapp"]);
            }
        );
    });
});
