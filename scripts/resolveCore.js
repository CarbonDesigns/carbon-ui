var fs = require("fs");
var path = require("path");

function resolveCodeModule(root, dir, moduleFileName){
    var fullDir = path.join(root, dir);
    var files = fs.readdirSync(fullDir);
    var modules = files.filter(x => x.startsWith(moduleFileName) && x.endsWith(".js"));
    if (modules.length === 0){
        throw new Error("No core modules found: " + dir);
    }
    if (modules.length > 1){
        throw new Error("Multiple core modules found, clean and download again.\r\n" + modules.join("\r\n"));
    }
    return path.join(fullDir, modules[0]);
}

module.exports = function(){
    var root = path.join(__dirname, "..");
    return {
        core: resolveCodeModule(root, "node_modules/@carbonium/carbon-core/lib", "carbon-core"),
        api: resolveCodeModule(root, "node_modules/@carbonium/carbon-api/lib", "carbon-api")
    }
};