var path = require("path");
var webpack = require("webpack");

var WebpackMd5Hash = require('webpack-md5-hash');

var defaults = {
    minimize: false,
    noUglify: false,
    verbose: false
};

function getPlugins(settings){
    var plugins = [
        new webpack.DllPlugin({
            path: fullPath("../target/[name]-manifest.json"),
            name: "[name]"
        }),

        new webpack.DefinePlugin({
            'process.env.NODE_ENV': settings.minimize ? '"production"' : '"dev"'
        }),

        new webpack.optimize.OccurenceOrderPlugin(),
        new WebpackMd5Hash()
    ];

    if (settings.minimize){
        if (!settings.noUglify){
            plugins.push(new webpack.optimize.UglifyJsPlugin({
                compressor: {
                    warnings: false
                }
            }));
        }
    }

    return plugins;
}

module.exports = function(settings){
    settings = Object.assign({}, defaults, settings);

    var config = {
        context : fullPath("../src"),
        entry: {
            vendors: [fullPath("../src/vendors")]
        },
        output: {
            path: fullPath("../target"),
            filename: "carbon-[name]-[hash].js",
            library: "[name]"
        },
        plugins: getPlugins(settings),
        resolve: {
            root: [fullPath("../src")],
            extensions: ["", ".js", ".jsx", ".less"]
        }
    };

    settings.verbose && console.log(config);

    return config;
};

function fullPath(relativePath){
    return path.join(__dirname, relativePath);
}