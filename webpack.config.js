const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: [
    './src/index'
  ],
  module: {
    rules: [
      {
        test: /\.(jpg|png)$/,
        use: {
          loader: 'url-loader',
        },
      },
    ],
    loaders: [
      { test: /\.js?$/, loader: 'babel', exclude: /node_modules/ },
      { test: /\.s?css$/, loader: 'style!css!sass' },
      { test: /\.(jpg|png)$/, loader: 'url-loader' },
    ]
  },
  resolve: {
    extensions: ['', '.js']
  },
  output: {
    path: path.join(__dirname, '/dist'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: './dist',
    hot: true
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]
};
