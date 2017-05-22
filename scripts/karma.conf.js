var path = require("path");
var fs = require("fs");
var webpack = require("webpack");
var fs = require('fs');
var webpackConfig = require('./make-ui-config')({
    devServer: false,
    host: "",
    vendorsFile: "fixme"
});

var testfolder = path.join(path.dirname(fs.realpathSync(__filename)), '..');
process.chdir(testfolder);

webpackConfig.entry = {};
webpackConfig.output.library = "test";
delete webpackConfig.output.libraryTarget;

for (var i = 0; i < webpackConfig.plugins.length; i++){
    var plugin = webpackConfig.plugins[i];
    if (plugin instanceof webpack.optimize.CommonsChunkPlugin){
        webpackConfig.plugins.splice(i, 1);
        --i;
    }
}

module.exports = function(config){
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../mylibs/',
        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', /*'chai-as-promised',*/ 'chai'],
        // list of files / patterns to load in the browser
        files: [
            '../target/carbon-vendors-*.js',
            '../node_modules/babel-polyfill/dist/polyfill.js',
            '../mylibs/test/ut/TestBootloader.js',
            // {pattern: 'fonts/**/*', included: false}
        ],
        // proxies: {
        //     '/fonts/': '/base/fonts/'
        // },
        // list of files to exclude
        exclude: [],
        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            '../mylibs/test/ut/TestBootloader.js': ['webpack']
        },
        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],
        // web server port
        port: 9876,
        // enable / disable colors in the output (reporters and logs)
        colors: true,
        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,
        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome_DevTools_Saved_Prefs'],
        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,
        webpack: webpackConfig,
        webpackServer: {
            noInfo: true
        },

        customLaunchers: {
            Chrome_DevTools_Saved_Prefs: {
                base: 'Chrome'
                ,flags: ['--enable-logging --v=1 --user-data-dir=' + path.join(require('os').homedir(), 'carbon-chrome')]
            }
        },

        client: {
            mocha: {
                timeout : 30 * 60 * 1000
            }
        },

        trxReporter: { outputFile: 'ui-tests.trx', shortTestName: false }
    })
};
