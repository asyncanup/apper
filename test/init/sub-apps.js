var assert = require("assert");

describe("sub-apps", function () {
    it("should skip directories to ignore as per arguments, apper.json, and default config", function () {
        var app = require("../app-maker")({
            dirToIgnore: ["subapp3"]
        });

        assert.deepEqual(Object.keys(app.subapps), ["subapp"]);
    });
});