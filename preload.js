const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  sendPrintSilent: (htmlToPrint, documentTitle) => {
    // console.log('preload ', htmlToPrint);
    ipcRenderer.send('print-silent', { htmlToPrint, documentTitle });
  },

  setCredentials: (username, password) => {
    ipcRenderer.send('set-credentials', { username, password });
  },
  getCredentials: (username) => {
    return ipcRenderer.invoke('get-credentials');
  }

});
