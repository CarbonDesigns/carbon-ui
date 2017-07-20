var fs = require('fs');
var glob = require('glob');
var path = require('path');
var crypto = require('crypto');
var lib = process.cwd();

var authorInfo = {
    authorId: "carbonium",
    authorName: "Carbonium",
    authorAvatar: "/ava/carbonium.png"
};

/**
 * CDN resources to go to cdn.com/resources/sample...
 * Local resources go to /target/resources/sample...
 *
 * reslist file always gots to cdn.com/target/
 */
function BundleResourcesPlugin(options) {
    if (!options.target) {
        throw "target folder for resource bundling is not defined";
    }

    this.target = options.target;
    this.cdn = options.cdn;
    this.publicPath = options.publicPath;
    this.bundleOptions = options.resourceBundleOptions;
};
BundleResourcesPlugin.prototype.apply = function (compiler) {
    var that = this;
    compiler.plugin('emit', function (compilation, callback) {
        // Create a header string for the generated file:
        var result = '';

        glob(that.target + "/**/package.json", {}, function (err, files) {
            if (err) {
                result += err;
            }
            var data = [];
            var items = [];
            for (var i = 0; i < files.length; ++i) {
                var text = fs.readFileSync(files[i], "utf-8");
                var resource = JSON.parse(text);

                var directory = path.dirname(files[i]);
                var resourceName = path.basename(directory);
                var dataUrl = resourceUrl(resourceName, resource.version, "data.json");
                var imageUrl = resourceUrl(resourceName, resource.version, "image.png");

                resource.dataUrl = that.cdn + "/" + dataUrl;
                resource.coverUrl = that.cdn + "/" + imageUrl;
                Object.assign(resource, authorInfo);
                data.push(resource);

                items.push({
                    directory: directory,
                    version: resource.version,
                    dataUrl: dataUrl,
                    imageUrl: imageUrl
                });
            }

            var allVersions = items.map(x => x.version).join();
            var hash = hashString(allVersions);
            var reslistFile = "reslist-" + hash + ".json";
            var reslistUrl = that.cdn + that.publicPath + "/" + reslistFile;

            result = JSON.stringify(data);
            that.bundleOptions.resourceFile = reslistUrl;

            compilation.assets[reslistFile] = {
                source: function () {
                    return result;
                },
                size: function () {
                    return result.length;
                }
            };

            for (var i = 0; i < items.length; ++i) {
                (function (item) {
                    var buffer = fs.readFileSync(item.directory + '/data.json');
                    compilation.assets[item.dataUrl] = {
                        source: function () { return buffer; },
                        size: function () {
                            return buffer.length;
                        }
                    };

                    var image = fs.readFileSync(item.directory + '/image.png');
                    compilation.assets[item.imageUrl] = {
                        source: function () { return image; },
                        size: function () {
                            return image.length;
                        }
                    };
                })(items[i]);
            }

            callback();

        })
    });
}

function hashString(str) {
    return crypto.createHash("md5").update(str).digest("hex");
}

function resourceUrl(directory, version, file) {
    return "resources/" + encodeURIComponent(directory) + "/" + version + "/" + file;
}

module.exports = BundleResourcesPlugin;