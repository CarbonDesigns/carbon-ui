"use strict";

var webpack = require("webpack");
var path = require("path");
var extend = require("node.extend");
var util = require("util");
var fs = require("fs");
var BundleResourcesPlugin = require("./BundleResourcesPlugin");
var resolveCoreModules = require("./resolveCore");

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
// var HtmlWebpackScriptCrossoriginPlugin = require('html-webpack-script-crossorigin-plugin');

var CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;

var defaults = {
    minimize: false,
    noUglify: false,
     debug: true,
    linkCore: false,
    devServer: true,
    port: 8080,
    host: "http://localhost",
    publicPath: "/target",
    devtool: "eval",
    verbose: false,
    showConfig: true,
    mainEntry: "./Main",
    trace: true,
    errors: true
};

function getEntry(settings) {
    var entry = {
        index: [
            //"babel-polyfill",
            settings.mainEntry
        ]
    };
    if (settings.devServer) {
        entry.index.unshift(
            'webpack-dev-server/client?' + settings.authority);
    }

    return entry;
}
function getOutput(settings) {
    var output = {
        publicPath: settings.fullPublicPath + "/"
    };

    output.filename = "carbon-[name].js";
    output.chunkFilename = "carbon-[name]-[id].js";
    output.path = fullPath("../target/");

    return output;
}
function getResolve(settings) {
    var resolves = {
        modules: [
            fullPath("../src"),
            fullPath("../node_modules")
        ],
        alias: {
            "bem": fullPath("../src/utils/commonUtils"),
            "fbjs/lib/memoizeStringOnly": fullPath("../node_modules/fbjs/lib/memoizeStringOnly")
        },
        extensions: [".ts", ".tsx", ".js", ".jsx", ".less", ".html"]
    };

    return resolves;
}

function getDebugOrCdnPath(settings, file) {
    var filePath;
    if (settings.minimize) {
        filePath = settings.fullPublicPath + "/" + path.basename(file);
    }
    else {
        filePath = "/" + file;
    }
    return filePath.replace(/\\/g, '/');
}

function getPlugins(settings) {
    let root = path.join(__dirname, "..");

    var coreScript, apiScript;
    if (settings.linkCore) {
        coreScript = "//localhost:8090/target/carbon-core.js";
        apiScript = "//localhost:8090/target/carbon-api.js";
    }
    else {
        let modules = resolveCoreModules();
        coreScript = getDebugOrCdnPath(settings, path.relative(root, modules.core));
        apiScript = getDebugOrCdnPath(settings, path.relative(root, modules.api));
    }

    let resourceBundleOptions = { resourceFile: null };
    var plugins = [
        //breaks incremental updates in watch mode...

        new BundleResourcesPlugin({
            cdn: settings.authority,
            publicPath: settings.publicPath,
            target: fullPath("../resources/"),
            resourceBundleOptions: resourceBundleOptions
        }),

        new HtmlWebpackPlugin({
            template: './res/index.ejs',
            chunksSortMode: 'none',
            vendorsScript: getDebugOrCdnPath(settings, path.relative(root, settings.vendorsFile)),
            apiScript: apiScript,
            coreScript: coreScript,
            resourceBundleOptions: resourceBundleOptions
        }),
        // new HtmlWebpackScriptCrossoriginPlugin({}),

        new CheckerPlugin(),

        new webpack.LoaderOptionsPlugin({
            debug: settings.debug
        })
    ];

    if (settings.devServer) {
        plugins.push(
            // new webpack.HotModuleReplacementPlugin(),
            new webpack.NamedModulesPlugin()
        );
    }

    var defines = {
        DEBUG: settings.debug,
        'process.env.NODE_ENV': settings.minimize ? '"production"' : '"dev"'
    };
    plugins.push(new webpack.DefinePlugin(defines));

    if (settings.minimize) {
        if (!settings.noUglify) {
            plugins.push(new webpack.optimize.UglifyJsPlugin({
                sourceMap: true,
                minimize: true
            }));
        }

        plugins.push(
            // new InlineManifestWebpackPlugin({
            //     name: 'webpackManifest'
            // }),

            // new webpack.optimize.CommonsChunkPlugin({
            //     names: ["common", "manifest"]
            // }),

            new (require('chunk-manifest-webpack-plugin'))({
                filename: "manifest.json",
                manifestVariable: "webpackManifest"
            }),

            new ExtractTextPlugin("[name]-[contenthash].css")
        );
    }

    plugins.push(
        new webpack.DllReferencePlugin({
            manifest: require(fullPath("../target/vendors-manifest.json")),
            context: fullPath("../src")
        }));

    return plugins;
}

function getLoaders(settings) {
    var plugins = [];

    plugins.push(
        require.resolve("babel-plugin-transform-promise-to-bluebird"),
        require.resolve("babel-plugin-transform-runtime"),
        require.resolve("babel-plugin-add-module-exports"),
        //remove when babel 6 has proper support for decorators
        require.resolve("babel-plugin-transform-decorators-legacy")
    );

    if (!settings.trace) {
        plugins.push(require.resolve("babel-plugin-transform-remove-console"));
    }
    if (settings.minimize) {
        plugins.push(require.resolve("babel-plugin-transform-react-constant-elements"));
        plugins.push(require.resolve("babel-plugin-transform-react-inline-elements"));
    }
    var babelSettings = {
        babelrc: false, //do not use settings from referenced packages
        "presets": [
            require.resolve("babel-preset-es2015"),
            require.resolve("babel-preset-stage-0"),
            require.resolve("babel-preset-react")
        ],
        "plugins": plugins,
        cacheDirectory: true
    };
    var babelLoader = {
        loader: "babel-loader",
        options: babelSettings
    };

    var tsloader = {
        loader : 'ts-loader',
        options: {

        }
     };

    var excludedFolders = ["node_modules", "libs", "generated"];
    var excludedFiles = ["carbon-core-.*", "carbon-api-.*", "CompilerWorker.w.js"];
    var excludes = new RegExp(
        excludedFolders.map(x => "[\/\\\\]" + x + "[\/\\\\]").join("|")
        + "|" + excludedFiles.join("|"));
    var loaders = [
        {
            test: /\.js$/,
            include: /oidc\-client/,
            use: [babelLoader]
        },
        {
            test: /\.js$/,
            include: /react\-color/,
            use: [babelLoader, "react-map-styles"]
        },
        {
            test: /\.(txt)$/,
            use: ['raw-loader']
        },
        {
            test: /\.jsx$/,
            // loaders: ["react-hot-loader/webpack", babelLoader],
            use: [babelLoader],
            exclude: excludes
        },
        {
            test: /\.tsx$/,
            // loaders: ["react-hot-loader/webpack", babelLoader, "awesome-typescript-loader"],
            use: [babelLoader, tsloader],
            exclude: excludes
        },
        {
            test: /[^\.]\w(?!\.d)\.ts$/,
            use: [babelLoader, tsloader],
            exclude: /node_modules/
        },
        {
            test: /\.js$/,
            use: [babelLoader],
            exclude: excludes
        },
        {
            test: /\.(png|gif|jpeg|jpg|cur|woff|woff2|eot|ttf|svg|gif)$/,
            use: [{
                loader: "file-loader",
                options: {
                    name: util.format("[path][name]%s.[ext]", settings.hashPattern)
                }
            }],
            exclude: excludes
        }
    ];

    loaders.push({
        test: /\.optional\.css$/,
        use: ["style-loader/useable", "css-loader"]
    });

    if (settings.minimize) {
        loaders.push({
            test: /\.less$/,
            use: ExtractTextPlugin.extract({
                use: [
                    "css-loader",
                    {
                        loader: "sourceMap-loader",
                        options: {
                            less: true
                        }
                    }]
            })
        });
    }
    else {
        var lessSettings = {};
        loaders.push({
            test: /\.less$/,
            use: [
                "style-loader",
                {
                    loader: "css-loader",
                    options: {
                        minimize: false,
                        sourceMap: true
                    }
                },
                "less-loader"]
        });
    }
    return loaders;
}

module.exports = function (settings) {
    settings = extend({}, defaults, settings);
    settings.authority = settings.host ? settings.host + (settings.port ? ":" + settings.port : "") : "";
    settings.fullPublicPath = settings.authority + settings.publicPath;
    settings.hashPattern = settings.minimize ? "-[hash]" : "";
    settings.chunkHashPattern = settings.minimize ? "-[chunkhash]" : "";
    settings.verbose && console.log(settings);

    var config = {
        context: fullPath("../src"),
        entry: getEntry(settings),
        output: getOutput(settings),
        resolve: getResolve(settings),
        externals: {
            "carbon-core": "window.c.core",
            "carbon-api": "window.c.api"
        },

        amd: { jQuery: true },
        module: {
            rules: getLoaders(settings)
        },
        plugins: getPlugins(settings),
        devtool: settings.devtool,
        // debug: !settings.minimize,
        devServer: {
            contentBase: fullPath('../'),
            publicPath: settings.fullPublicPath + "/",
            host: settings.host.substring(settings.host.indexOf("//") + 2),
            port: settings.port,
            // hot: true,
            historyApiFallback: {
                rewrites: [
                    {
                        from: /^\/(resources)/g,
                        to: function (context) {
                            return settings.publicPath + context.parsedUrl.pathname;
                        }
                    },
                    {
                        from: /^((?!\.(png|cur|js|ts|tsx|woff|ttf|eot|svg|json|gif|css|txt)).)*$/g,
                        to: settings.publicPath + '/index.html'
                    }
                ]
            },
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization, X-SessionId"
            },
            stats: {
                colors: true,
                timings: true,
                assets: settings.verbose,
                chunks: settings.verbose,
                modules: settings.verbose,
                children: settings.verbose,
                hash: settings.verbose,
                version: settings.verbose,
                errors: settings.errors,
                errorDetails: settings.errors
            }
        },
        // headers: {
        //     "Access-Control-Allow-Origin": "*",
        //     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        //     "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
        // },
        cache: true
    };

    settings.verbose && console.log(config);

    return config;
};

function fullPath(relativePath) {
    return path.join(__dirname, relativePath);
}
