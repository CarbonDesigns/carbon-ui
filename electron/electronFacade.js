const {dialog} = require('electron')
const fs = require('fs');


module.exports = {
    save:function(fileName, data){
        fs.writeFile(fileName, data);
    },

    open:function(fileName, callback){
        fs.readFile(fileName, function(err, data){
            callback(err, data);
        })
    },

    saveResourcePackage:function(folder, data){
        var package = {
            name:data.name,
            description:data.description,
            tags: data.tags
        };
        fs.writeFile(folder + '/package.json', JSON.stringify(package));
        fs.writeFile(folder + '/data.json', JSON.stringify(data.data));
        fs.writeFile(folder + '/image.png', data.image.substr(1+data.image.indexOf(',')), 'base64');
    }
};