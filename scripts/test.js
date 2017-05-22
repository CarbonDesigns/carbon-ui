require("babel-register");

var fs = require("fs");
var path = require("path");
var argv = require('yargs').argv;

var KarmaServer = require('karma').Server;



function runKarma(singleRun){
    var settings = {
        configFile: path.join(__dirname, './karma.conf.js'),
        singleRun: singleRun
    };
    if (singleRun){
        settings.reporters = ["trx"];
        settings.browsers = ["PhantomJS"];
        settings.browserNoActivityTimeout = 5 * 60 * 1000;
    }

    var server = new KarmaServer(settings);
    server.start();
}

runKarma(!argv.watch);