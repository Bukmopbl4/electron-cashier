const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require("electron-updater");
autoUpdater.setFeedURL({
  provider: "github",
  owner: "Bukmopbl4",
  repo: "electron-cashier",
  private: false,
  requestHeaders: { "Cache-Control": "no-cache" },
});

let win;

const path = require('path')
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

function createWindow() {

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    center: true,
    minWidth: 800,
    minHeight: 600,
    maximizable: true,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: true,
      autoHideMenuBar: true,
      // nodeIntegration: true
      //   enableRemoteModule: true,
      //   contextIsolation: false,
    }
  })
  // win.removeMenu();
  win.setMenuBarVisibility(false);
  win.maximize();
  // win.loadURL('http://127.0.0.1:8000')
  win.loadURL('https://caja.misuerte.bet')
}



app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
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

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on("update-available", () => {
  // Здесь вы можете определить действия, которые будут выполняться, когда обновление будет доступно
  console.log('update-available');
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.');
});

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
});

autoUpdater.on("update-downloaded", () => {
  console.log('update-downloaded');
  // Здесь вы можете определить действия, которые будут выполняться после скачивания обновления
  // autoUpdater.quitAndInstall();
});

Object.defineProperty(app, 'isPackaged', {
  get() {
    return true;
  }
});

autoUpdater.checkForUpdates(forceDev = false);