const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const portFinderSync = require('portfinder-sync')
const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].[contenthash:8].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html'
    }),
    new FaviconsWebpackPlugin('./src/assets/favicon.png')
],
  module: {
    rules: [
      {
        test: /\.json/,
        type: 'asset/source'
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|mp4)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  devServer: {
    contentBase: './dist',
    host: '0.0.0.0',
    port: portFinderSync.getPort(8080)
  }
}