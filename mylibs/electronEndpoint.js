if (window && window.process && window.process.type === 'renderer') {
    var remoteElectron = global["require"]('electron').remote;
    var facade = remoteElectron.require('./electronFacade');
}

export default {
    saveFile: (options, dataCallback)=> {
        return new Promise(function (resolve) {
            remoteElectron.dialog.showSaveDialog(options, fileName=> {
                facade.save(fileName, dataCallback());
                resolve();
            });
        })
    },

    openFile: ()=> {
        return new Promise(function (resolve, reject) {
            remoteElectron.dialog.showOpenDialog({properties: ['openFile']}, fileName=> {
                facade.open(fileName[0], (err, content)=> {
                    if (err) {
                        console.error(err);
                        reject(err);
                        return;
                    }
                    var data = JSON.parse(content);
                    resolve(data);
                });
            });
        })
    },

    saveResource: (dataCallback)=> {
        return new Promise(function (resolve, reject) {
            remoteElectron.dialog.showOpenDialog({
                properties: ['openDirectory']
            }, folderName=> {
                dataCallback().then((data)=> {
                    facade.saveResourcePackage(folderName[0], data);//.then(resolve).catch(reject);
                    resolve();
                })
            });
        })
    }
}