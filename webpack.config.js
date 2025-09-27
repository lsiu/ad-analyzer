const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    content: './js/content.js',
    popup: './js/popup.js',
    background: './js/background.js',
    openrtb_devtool_panel: './js/openrtb_devtool_panel.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: '.' },
        { from: 'popup.html', to: '.' },
        { from: 'openrtb_devtools.html', to: '.' },
        { from: 'openrtb_devtools.js', to: '.' },
        { from: 'openrtb_devtools_panel.html', to: '.' },
        { from: 'icons', to: 'icons' },
        { from: 'styles.css', to: '.' }
      ]
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    }
  }
};