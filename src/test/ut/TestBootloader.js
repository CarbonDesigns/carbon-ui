var req = require.context('./specs', true, /\.ts$/);

req.keys().forEach(req);

module.exports = req;
