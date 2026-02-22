const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    content: './src/js/content.js',
    popup: './src/jsx/popup.jsx',
    background: './src/js/background.js',
    openrtb_panel: './src/jsx/openrtb_panel.jsx'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/popup.html',
      filename: 'popup.html',
      chunks: ['popup']
    }),
    new HtmlWebpackPlugin({
      template: './src/openrtb_panel.html',
      filename: 'openrtb_panel.html',
      chunks: ['openrtb_panel']
    }),
    new HtmlWebpackPlugin({
      template: './src/openrtb_devtools.html',
      filename: 'openrtb_devtools.html',
      chunks: []
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/manifest.json', to: '.' },
        { from: 'src/openrtb_devtools.js', to: '.' },
        { from: 'src/icons', to: 'icons' },
        { from: 'src/jsx/styles.css', to: '.' }
      ]
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    }
  }
};