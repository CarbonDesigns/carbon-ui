require("babel-register");
var webpack = require('webpack');
var fs = require("fs");
var path = require("path");

function findVendorsFiles(){
    var root = path.join(__dirname, "../target");
    var targetFiles = fs.readdirSync(root);
    return targetFiles.filter(x => x.indexOf("carbon-vendors-") !== -1).map(x => path.join(root, x));
}

module.exports = function(settings, cb){
    var vendors = findVendorsFiles();
    if (vendors.length !== 1 || settings.vendors){
        console.log("Generating vendors file, this should happen once or when forced...");

        for (var i = 0; i < vendors.length; i++){
            fs.unlinkSync(path.join(__dirname, "../target", vendors[i]));
        }

        var config = require("./make-vendors-config")(settings);
        webpack(config, function(err, stats){
            if (err){
                return cb(err);
            }
            console.log(stats.toString({colors: !settings.noColors}));

            var json = stats.toJson();
            if (json.errors.length){
                return cb(new Error('webpack failed'));
            }

            vendors = findVendorsFiles();
            if (vendors.length !== 1){
                return cb(new Error("Expected exactly 1 vendor file to be generated"));
            }
            cb(null, vendors[0]);
            //var statsPath = path.join(webpackConfig.output.path, "stats.json");
            //console.log("Writing stats", statsPath);
            //fs.writeFileSync(statsPath, JSON.stringify(json, null, '  '), 'utf-8');
        });
    }
    else{
        console.log("Found existing vendors file", vendors[0]);
        cb(null, vendors[0]);
    }
};