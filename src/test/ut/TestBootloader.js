var req = require.context('./specs', true, /\.js$/);

req.keys().forEach(req);

module.exports = req;
