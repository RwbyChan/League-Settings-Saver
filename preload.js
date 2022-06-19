const { ipcRenderer, contextBridge } = require("electron");
//const fs = require('fs');
const fs = require('fs-extra');

let settings = require(__dirname + '/data.json'); 

function persist_to_file() {
    fs.writeFile(__dirname + "/data.json", JSON.stringify(settings, null, 4), (err) => { if(err) { log_error(err); console.log(err); } });
}

function log_error(error) {
    let date_ob = new Date();
    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);
    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    // current year
    let year = date_ob.getFullYear();
    // current hours
    let hours = date_ob.getHours();
    // current minutes
    let minutes = date_ob.getMinutes();
    // current seconds
    let seconds = date_ob.getSeconds();

    var time = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
    var error = time + '\n' + error + '\n\n'; 
    fs.appendFileSync(__dirname + "/logs.txt", error);
}

const LEAGUE_CONFIG_DIR = '/Config';

// Expose protected methods off of window (ie.
// window.api.sendToA) in order to use ipcRenderer
// without exposing the entire object
contextBridge.exposeInMainWorld("api", {
    store: function(data) {
        settings = data;
        persist_to_file();
    },
    getData: function() {
        return settings
    },
    selectDir:(title, default_dir) => ipcRenderer.invoke('dialog:openDirectory', title ? title : 'Select folder', default_dir ? default_dir : __dirname),
    export: function(dir, cb) {
        fs.copy(settings.league_dir + LEAGUE_CONFIG_DIR, dir, { overwrite: true })
        .then(() => {
            cb({ type: 'success', message: 'Config files successfully exported!'});
        })
        .catch(err => {
            cb({ type: 'error', message: 'Error exporting files'});
            log_error(err);
        });
    },
    import: function(dir, cb) {
        fs.copy(dir, settings.league_dir + LEAGUE_CONFIG_DIR, { overwrite: true })
        .then(() => {
            cb({ type: 'success', message: 'Config files successfully imported!'});
        })
        .catch(err => {
            cb({ type: 'error', message: 'Error importing files'});
            log_error(err);
        });
    }
});