const { app, dialog, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
  
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 300,
    height: 150,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    resizable: false
  });

  // set icon
  mainWindow.setIcon(path.join(__dirname, '/assets/icon.png'));

  // remove menu bar
  mainWindow.removeMenu();

  // handle file opener
  ipcMain.handle('dialog:openDirectory', async (event, title, default_dir) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {  title: title, defaultPath : default_dir, properties: ['openDirectory']});

    if(canceled) {
      return false;
    } else {
      return filePaths[0];
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));  

  // Show once finished loading
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools({mode: 'undocked'});

  // rest of code..
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
  
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.