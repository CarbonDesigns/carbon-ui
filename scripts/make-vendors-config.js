var path = require("path");
var webpack = require("webpack");
var UglifyWebpackPlugin = require("uglifyjs-webpack-plugin");

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

       // new webpack.optimize.OccurenceOrderPlugin(),
    ];

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
            filename: "carbon-[name]-[hash:4].js",
            library: "[name]"
        },
        plugins: getPlugins(settings),
        resolve: {
            modules: [fullPath("../src"), fullPath("../node_modules")],
            extensions: [".js", ".jsx", ".less"]
        },
        mode: settings.minimize ? "development" : "production",
        optimization: {
            minimizer: settings.minimize && !settings.noUglify ? [new UglifyWebpackPlugin({ sourceMap: true })] : [],
        }
    };

    settings.verbose && console.log(config);

    return config;
};

function fullPath(relativePath){
    return path.join(__dirname, relativePath);
}