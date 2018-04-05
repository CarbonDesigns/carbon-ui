var path = require("path");
var open = require("open");
var express = require('express');
var app = express();

var target = path.resolve(path.join(__dirname, '/../target'));
var port = 8080;

app.use('/img', express.static(path.join(target, 'img')));
app.use('/fonts', express.static(path.join(target, 'fonts')));
app.use('/target', express.static(target));
app.get('/', function(req, res) {
    res.sendFile(target + '/index.html');
});
app.get('*', function(req, res) {
    res.sendFile(target + '/index.html');
});
app.listen(port);
console.log(`Listening on port ${port}`)

open(`http://localhost:${port}/app?serverless&cls`);