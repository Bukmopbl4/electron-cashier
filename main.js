const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require("electron-updater");
const Store = require('electron-store');
const store = new Store();

autoUpdater.setFeedURL({
  provider: "github",
  owner: "Bukmopbl4",
  repo: "electron-cashier",
  private: false,
  requestHeaders: { "Cache-Control": "no-cache" },
});

let mainWin;
let win;

const path = require('path')
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

function createWindow() {

  mainWin = new BrowserWindow({
    width: 800,
    height: 600,
    center: true,
    minWidth: 800,
    minHeight: 600,
    maximizable: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: true,
      autoHideMenuBar: true,
      // nodeIntegration: true
      //   enableRemoteModule: true,
      //   contextIsolation: false,
    }
  });
  
  // win.removeMenu();
  mainWin.setTitle(`Cashier ${app.getVersion()}`);
  mainWin.setMenuBarVisibility(false);
  mainWin.maximize();
  // win.show();
  // mainWin.loadURL('http://127.0.0.1:8000')
  mainWin.loadURL('https://caja.misuerte.bet');
  
}



app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  });
  autoUpdater.checkForUpdates();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})



ipcMain.on('print-silent', (event, data) => {
  const { BrowserWindow } = require('electron');
  const win = new BrowserWindow({
    show: false,
    title: data.documentTitle,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadURL(`data:text/html,<html><head><meta charset="UTF-8"/></head><body style="margin:0;">
    ${encodeURIComponent(data.htmlToPrint)}</body></html>`);

  win.webContents.on('did-finish-load', async () => {
    let printersInfo = await win.webContents.getPrintersAsync();
    let printer = printersInfo.filter(printer => printer.isDefault === true)[0];
    console.log('Printer:', printer.name);
    win.webContents.print(
      {
        silent: true,
        deviceName: printer.name,
        printBackground: true,
        margins: { marginType: 'none' }
      },
      (success, failureReason) => {
        if (!success) {
          console.log('Ошибка печати:', failureReason);
        }
        win.close();
      }
    );
  });
});

ipcMain.on('set-credentials', (event, { username, password }) => {
  store.set('username', username);
  store.set('password', password);
});

ipcMain.handle('get-credentials', (event) => {
  const savedUsername = store.get('username', '');
  const savedPassword = store.get('password', '');
  return { username: savedUsername, password: savedPassword };
});

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
  mainWin.setTitle(`Cashier ${app.getVersion()}: Checking for update...`);
});

autoUpdater.on("update-available", () => {
  // Здесь вы можете определить действия, которые будут выполняться, когда обновление будет доступно
  console.log('update-available');
  mainWin.setTitle(`Cashier ${app.getVersion()}: Update-available.`);
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.');
  mainWin.setTitle(`Cashier ${app.getVersion()}`);
});

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ' + err);
  mainWin.setTitle(`Cashier ${app.getVersion()}: Error in auto-updater.`);
});

autoUpdater.on('download-progress', (progressObj) => {
  let downloadSpeedKBps = (progressObj.bytesPerSecond / 1024).toFixed(2);
  let log_message = "Download speed: " + downloadSpeedKBps + " KB/s";
  let roundedPercent = Math.round(progressObj.percent);
  let transferredMB = (progressObj.transferred / (1024 * 1024)).toFixed(2);
  let totalMB = (progressObj.total / (1024 * 1024)).toFixed(2);
  log_message = log_message + ' - Downloaded ' + roundedPercent + '%';
  log_message = log_message + ' (' + transferredMB + "/" + totalMB + ' MB)';
  console.log(log_message);
  mainWin.setTitle(`Cashier ${app.getVersion()}: ${log_message}`);
});

autoUpdater.on("update-downloaded", () => {
  console.log('update-downloaded');
  mainWin.setTitle(`Cashier ${app.getVersion()}: Update-downloaded.`);
  // Здесь вы можете определить действия, которые будут выполняться после скачивания обновления
  autoUpdater.quitAndInstall();
});

// Object.defineProperty(app, 'isPackaged', {
//   get() {
//     return true;
//   }
// });

// autoUpdater.checkForUpdates(forceDev = false);