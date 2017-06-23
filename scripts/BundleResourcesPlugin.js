var fs = require('fs');
var glob = require('glob');
var path = require('path');
var lib  = process.cwd();

var authorInfo = {
    authorId: "carbonium",
    authorName: "Carbonium",
    authorAvatar: "/ava/carbonium.png"
};

function BundleResourcesPlugin(options) {
    if(!options.target){
        throw "target folder for resource bundling is not defined";
    }

    this.target = options.target;
    this.cdn = options.cdn;
};
BundleResourcesPlugin.prototype.apply = function (compiler) {
    var that = this;
    compiler.plugin('emit', function(compilation, callback) {
        // Create a header string for the generated file:
        var result = '';

        glob(that.target + "/**/package.json", {}, function (err, files) {
            if(err)
            {
                result += err;
            }
            var data = [];
            var items = [];
            for(var i = 0; i < files.length; ++i) {
                var text = fs.readFileSync(files[i], "utf-8");

                var directory = path.dirname(files[i]);
                items.push({
                    directory:directory,
                    idx:i
                })

                var resource = JSON.parse(text);
                resource.dataUrl = that.cdn + "/target/"+i+"/data.json";
                resource.coverUrl = that.cdn + "/target/"+i+"/image.png";
                Object.assign(resource, authorInfo);
                data.push(resource);
            }

            result = JSON.stringify(data);
            // Insert this list into the Webpack build as a new file asset:
            compilation.assets['reslist.json'] = {
                source: function() {
                    return result;
                },
                size: function() {
                    return result.length;
                }
            };

            for(var i = 0; i< items.length; ++i){
                (function(item){
                    var buffer = fs.readFileSync(item.directory+'/data.json');
                    compilation.assets[item.idx + '/data.json'] = {
                        source: function() { return  buffer; },
                        size: function(){
                            return buffer.length;
                        }
                    };

                    var image = fs.readFileSync(item.directory+'/image.png');
                    compilation.assets[item.idx + '/image.png'] = {
                        source: function() { return  image; },
                        size: function(){
                            return image.length;
                        }
                    };
                })(items[i]);
            }

            callback();

        })
    });
}
module.exports = BundleResourcesPlugin;