require("babel-register");
var webpack = require('webpack');
var fs = require("fs");
var crypto = require('crypto');
var path = require("path");
var Promise = require("bluebird");
var argv = require('yargs').argv;

var webpackAsync = Promise.promisify(webpack);

function pack(webpackConfig) {
    process.env.NODE_ENV = 'production';
    return webpackAsync(webpackConfig)
        .then(stats => {
            console.log(stats.toString({colors: !argv.noColors}));
            var json = stats.toJson();
            if (json.errors.length){
                throw new Error('webpack failed');
            }
            //var statsPath = path.join(webpackConfig.output.path, "stats.json");
            //console.log("Writing stats", statsPath);
            //fs.writeFileSync(statsPath, JSON.stringify(json, null, '  '), 'utf-8');

            hash();
        });
}

function hash(){
    var manifest = JSON.parse(fs.readFileSync(fullPath("../target/manifest.json"), 'utf-8'));
    var promises = [hashFile("index", "carbon-index.js")];
    for (var id in manifest){
        promises.push(hashFile(id, manifest[id]));
    }
    Promise.all(promises).then(function(hashes){
        var newIndexName = null;

        for (var i = 0; i < hashes.length; i++){
            var h = hashes[i];
            var newJs = path.parse(h.file).name + "-" + h.hash + path.extname(h.file);
            var filePath = fullPath("../target", h.file);

            var contents = fs.readFileSync(filePath, 'utf-8');
            contents = contents.replace("sourceMappingURL=" + h.file, "sourceMappingURL=" + newJs);
            fs.writeFileSync(filePath, contents, 'utf8');

            fs.renameSync(filePath, fullPath("../target", newJs));
            fs.renameSync(fullPath("../target", h.file + ".map"), fullPath("../target", newJs + ".map"));

            if (h.id !== "index"){
                manifest[h.id] = newJs;
            }
            else{
                newIndexName = newJs;
            }
        }

        if (!newIndexName){
            throw new Error("Could not find new name for index.js");
        }

        var html = fs.readFileSync(fullPath("../target/index.html"), 'utf8');
        html = html.replace('//manifest', "window.webpackManifest=" + JSON.stringify(manifest) + ";");
        html = html.replace('/target/carbon-index.js', "/target/" + newIndexName);
        fs.writeFileSync(fullPath("../target/index.html"), html, 'utf-8');

        console.log("New manifest:", manifest);
    });
}
function hashFile(id, file){
    return new Promise(function(resolve){
        var md5 = crypto.createHash('md5');
        md5.setEncoding('hex');

        var stream = fs.createReadStream(fullPath("../target", file));
        stream.on('end', function() {
            md5.end();
            resolve({id: id, file: file, hash: md5.read()});
        });
        stream.pipe(md5);
    });
}

function fullPath(){
    var args = [__dirname].concat(Array.prototype.slice.call(arguments));
    return path.join.apply(path, args);
}

var vendorsOptions = Object.assign({}, argv, {
    minimize: true
});

var packVendors = require("./packVendors");
packVendors(vendorsOptions, function(err, file){
    if (err){
        throw err;
    }

    var config = require("./make-ui-config")(Object.assign({
        devServer: false,
        minimize: true,
        debug: false,
        trace: false,
        devtool: "#source-map",
        host: "",
        port: ""
    }, argv, {
        vendorsFile: file
    }));

    pack(config);
});