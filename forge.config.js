const fs = require('fs');
const path = require('path');

// Укажите здесь языки, которые вы хотите оставить (коды языков)
const localesToKeep = ['en-US', 'ru', 'es', 'fr', 'it', 'es-419'];

function deleteUnwantedLocales(buildPath) {
  const localesPath = path.join(buildPath, 'locales');
  if (!fs.existsSync(localesPath)) return;

  const files = fs.readdirSync(localesPath);
  files.forEach((file) => {
    const locale = file.replace('.pak', '');
    if (!localesToKeep.includes(locale)) {
      fs.unlinkSync(path.join(localesPath, file));
    }
  });
}
module.exports = {
  rebuildConfig: {},
  packagerConfig: {
    osxSign: {},
    afterCopy: [(buildPath, electronVersion, platform, arch, callback) => {
      deleteUnwantedLocales(buildPath);
      callback();
    }],
    ignore: [
      'LICENSES.chromium.html',
      '.DS_Store'
    ],
    publishers: [
      {
        name: '@electron-forge/publisher-github',
        platforms: ['win32'],
        config: {
          repository: {
            owner: 'Bukmopbl4',
            name: 'electron-cashier'
          }
        }
      }
    ],
    asar: true,
    icon: process.platform === "darwin" ? "app.icns" : "app.ico"
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'cashier',
        platforms: ['win32'],
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
      platforms: ['linux'],
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
      platforms: ['linux']
    },
  ],
};
