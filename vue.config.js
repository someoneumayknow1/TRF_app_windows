const fs = require('fs');
const packageJson = fs.readFileSync('./package.json');
const version = JSON.parse(packageJson).version || '0';
const webpack = require('webpack');

module.exports = {
  transpileDependencies: ['vuetify', 'juice'],
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env.PACKAGE_VERSION': '"' + version + '"'
      })
    ]
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: false,
      preload: 'src/preload.ts',
      builderOptions: {
        productName: 'TRF Bar 3',
        appId: 'com.trf.bar3',
        win: {
          target: ['nsis', 'portable'],
          icon: 'public/icon.ico'
        },
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true
        }
      }
    }
  }
};
