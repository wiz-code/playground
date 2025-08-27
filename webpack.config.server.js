const path = require('node:path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require('dotenv-webpack');
const babelConfig = require('./src/server/.babelrc.js');

module.exports = (env, arg) => ({
  target: 'node',
  externalsPresets: { node: true },

  devtool: 'inline-source-map',

  stats: {
    errorDetails: true,
  },

  entry: {
    index: './src/server/index.js',
  },

  output: {
    path: path.resolve(__dirname, 'dist/server'),
    filename: '[name].js',
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules(?!\/@fails-components\/webtransport)/,
        //exclude: /node_modules/,
        include: /node_modules(?=\/@fails-components\/webtransport)/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },

  plugins: [
    new Dotenv(),
    new CopyPlugin({
      patterns: [
        {
          from: '**/*',
          to: 'views',
          context: path.resolve(__dirname, './src/server/views'),
        },
      ],
    }),
  ],

  optimization: {
    minimize: arg.mode === 'production',
    minimizer: [
      new TerserPlugin(),
    ],
  },

  resolve: {
    alias: {
      '@lib': path.resolve(__dirname, '../../lib'),
    },
    extensions: ['.js', '.cjs', '.mjs'],
  },
});