var path = require("path");
var express = require('express');
var fallback = require('express-history-api-fallback');

var app = express();
var root = path.join(__dirname, '../target');

app.use('/target', express.static(root));
app.use(fallback('index.html', { root: root }));

app.listen(3000, function () {
    console.log('Target app listening on port 3000!')
});