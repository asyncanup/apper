// # File system utilities
// TODO: Yet to refactor
var fs = require('fs'),
    path = require('path'),
    json5 = require('json5');

var _ = require('underscore'),
    requirejs = require('requirejs'),
    UglifyJS = require('uglify-js');

exports.loadModule = function (app, modulePath) {
    var loadedModule;
    try {
        loadedModule = require(modulePath);
    } catch (e) { errorLoadingModule(e); }
    
    if (typeof loadedModule === 'function') {
        // the module to be loaded must be a function
        try {
            loadedModule.call(app.expressApp, app.expressApp);
        } catch (e) { errorLoadingModule(e); }
        
        return true;
    }
    
    function errorLoadingModule(e) {
        console.log(['Error loading module:', modulePath, e.stack].join('\n'));
    }
    
    return false;
};


var loadedCache = {},
    excludeFromCache = {};

exports.loadIndexFile = function (app, callback) {
    var indexFilePath = path.join(app.staticContentPath, 'index.html'),
        log = app.log.bind(app);
    
    if (loadedCache[indexFilePath]) {
        callback(null, loadedCache[indexFilePath]);
        return;
    }

    if (excludeFromCache[indexFilePath]) {
        callback(excludeFromCache[indexFilePath]);
        return;
    }

    log('Request for index file at: ' + indexFilePath);
    fs.readFile(indexFilePath, function (err, data) {
        if (err) {
            log('Could not read index file at: ' + indexFilePath);
            excludeFromCache[indexFilePath] = err;
            callback(err);
            return;
        }

        var code = {
            html: data.toString()
        };

        var scriptRegExp = /<script[^>]*src="([^"]+)"[^>]*><\/script>/gm,
            requireRegExp = /<script[^>]*data\-main="([^"]+)"[^>]*><\/script>/gm,
            styleRegExp = /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/gm;

        var scriptElements = getElements(code.html, scriptRegExp),
            requireElements = getElements(code.html, requireRegExp),
            styleElements = getElements(code.html, styleRegExp),
            totalFiles = scriptElements.length + requireElements.length + styleElements.length;

        var partDone = _.after(totalFiles, done);

        requireElements.forEach(optimize(app.staticContentPath, code, partDone, log));
        styleElements.forEach(replaceWith('style', 'href', app.staticContentPath, code, partDone, log));
        scriptElements.forEach(replaceWith('script', 'src', app.staticContentPath, code, partDone, log));

        function done() {
            log('Cached: ' + indexFilePath);
            loadedCache[indexFilePath] = code.html;
            callback(null, loadedCache[indexFilePath]);
        }
    });
};

function getElements(html, regExp) {
    var elements = [],
        match = regExp.exec(html);

    while (match) {
        elements.push({
            tag: match[0],
            path: match[1]
        });
        match = regExp.exec(html);
    }

    return elements;
}

function optimize(staticContentPath, code, callback, log) {
    log = log || console.log;

    return function (resource) {
        var resourcePath = resource.path,
            resourceTag = resource.tag,
            startTag = '<script data-requirejs="' + resourcePath + '">\n',
            endTag = '</script>',
            newTag = startTag.trim() + endTag;

        var resourceFilePath = path.join(staticContentPath, resourcePath + '.js'),
            cacheContents = loadedCache[resourceFilePath];
        
        code.html = code.html
            .split(resourceTag)
            .join(resourceTag + newTag);
        resourceTag = newTag;

        if (cacheContents) {
            code.html = code.html
                .split(resourceTag)
                .join(startTag + cacheContents + endTag);
            callback();
            return;
        }

        var parts = resourcePath.split('/'),
            mainFile = parts.pop().replace(/\.js$/, ''),
            baseUrl = path.join(staticContentPath, parts.join('/')),
            outFile = path.join(staticContentPath, _.uniqueId('require-build-') + '.rjs');
        
        log('Optimizing: ' + resourceFilePath);
        
        var requireConfig;
        try {
            requireConfig = require(path.join(baseUrl, 'require-config'));
        } catch (e) {
            log('No require-config found');
            log(e.message);
            
            try {
                var mainFileContents = fs.readFileSync(path.join(baseUrl, mainFile + '.js')).toString();
                requireConfig = findRequireJsOptions(mainFileContents);
            } catch (e) {
                log('Reading main file\'s contents to get RequireJS options did not work.');
                log(e.message);
                
                requireConfig = {};
            }
        }
        
        var rjsOptions = {
            baseUrl: baseUrl,
            name: mainFile,
            out: outFile
        };
        
        if (requireConfig.baseUrl) {
            rjsOptions.baseUrl = path.join(staticContentPath, requireConfig.baseUrl);
            delete requireConfig.baseUrl;
        }
        
        requirejs.optimize(
            _.extend(rjsOptions, requireConfig),
            function () {
                fs.readFile(outFile, function (err, builtContents) {
                    if (err) {
                        log('Could not read created build file: ' + outFile);
                        log(err.message);
                        callback();
                        return;
                    }
                    
                    fs.unlink(outFile, function (err) {
                        if (err) {
                            log('Could not delete built file: ' + outFile);
                            log(err.message);
                            return;
                        }
                    });

                    builtContents = builtContents.toString();
                    loadedCache[resourceFilePath] = builtContents;
                    
                    code.html = code.html
                        .split(resourceTag)
                        .join(startTag + builtContents + endTag);
                    callback();
                }
            );
        }, function (err) {
            log('Could not optimize: ' + resourceFilePath);
            log(err.message);

            fs.readFile(resourceFilePath, function (err, mainFileContents) {
                if (err) {
                    log('Could not read requirejs main file: ' + resourceFilePath);
                    log(err.message);
                    callback();
                    return;
                }

                mainFileContents = minify(mainFileContents.toString(), resourceFilePath, log);

                mainFileContents = 'require.config({baseUrl: "' + parts.join('/') + '"});\n' + mainFileContents;
                loadedCache[resourceFilePath] = mainFileContents;

                code.html = code.html
                    .split(resourceTag)
                    .join(startTag + mainFileContents + endTag);
                callback();
            });
        });
    };
}

function findRequireJsOptions(contents) {
    var optionsRegex = /requirejs\.config\((\{[\s\S]*\})\);/gm,
        match = optionsRegex.exec(String(contents));
    return json5.parse(match && match[1]);
}

function replaceWith(tagName, pathAttribute, staticContentPath, code, callback, log) {
    log = log || console.log;
    
    return function (resource) {
        var resourcePath = resource.path,
            resourceTag = resource.tag,
            startTag = '<' + tagName +
                ' data-' + pathAttribute + '="' + resourcePath + '">\n',
            endTag = '</' + tagName + '>',
            resourceBaseUrl = resourcePath.split('/').slice(0, -1).join('/');

        if (/^\//.test(resourcePath) || /^http/.test(resourcePath)) {
            log('URL is not relative: ' + resourcePath);
            callback();
            return;
        }
        
        var resourceFilePath = path.join(staticContentPath, resourcePath),
            cacheContents = loadedCache[resourceFilePath];
        
        if (cacheContents) {
            code.html = code.html
                .split(resourceTag)
                .join(startTag + cacheContents + endTag);
            callback();
            return;
        }

        fs.readFile(resourceFilePath, function (err, contents) {
            if (err) {
                log('Could not read resource file at: ' + resourceFilePath);
                callback();
                return;
            }
            
            contents = contents.toString();
            if (tagName === 'script') {
                contents = minify(contents, resourceFilePath, log);
            }
            if (tagName === 'style') {
                contents = correctStyleUrls(contents, resourceBaseUrl);
            }
            
            log('Cached: ' + resourceFilePath);
            loadedCache[resourceFilePath] = contents;
            code.html = code.html
                .split(resourceTag)
                .join(startTag + contents + endTag);
            callback();
        });
    };
}

function correctStyleUrls(css, resourceBaseUrl) {
    var urlRegex = /url\((['"])(.*)\1\)/gm,
        match = urlRegex.exec(css);
    
    while (match) {
        css = css.replace(match[2], resourceBaseUrl + '/' + match[2]);
        match = urlRegex.exec(css);
    }
    return css;
}

function minify(js, resourcePath, log) {
    if (/min\.js$/.test(resourcePath)) return js;
    
    log('Minifying: ' + resourcePath);
    return UglifyJS.minify(js, {
        fromString: true
    }).code;
}