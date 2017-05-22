require("babel-register");

var fs = require("fs");
var open = require("open");
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var argv = require('yargs').argv;

function watch(options) {
    var config    = require("./make-ui-config")(options);
    var devServer = config.devServer;
    var compiler  = webpack(config);

    console.log("Starting webpack...");
    new WebpackDevServer(compiler, devServer).listen(devServer.port, devServer.host,
        function (err) {
            if (err) return cb(err);
            open(`http://${devServer.host}:${devServer.port}/app?serverless&clearStorage`);
        });
}

var packVendors = require("./packVendors");
packVendors(argv, function(err, file){
    if (err){
        throw err;
    }
    watch(Object.assign({}, argv, {vendorsFile: file}));
});