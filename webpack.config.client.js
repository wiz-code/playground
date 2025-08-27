const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const babelConfig = require('./src/client/.babelrc');

const json = fs.readFileSync('./src/common.json', 'utf-8');
const { Meta } = JSON.parse(json);

const meta = new Map(Meta);
const siteName = meta.get('siteName');
const Keywords = meta.get('keywords');
const Description = meta.get('description');
const keywordsMap = new Map(Keywords);
const descriptionMap = new Map(Description);

module.exports = (env, arg) => ({
  mode: arg.mode ?? 'development',

  devtool: 'inline-source-map',

  stats: {
    errorDetails: true,
  },

  entry: {
    app: './src/client/index.jsx',
  },

  output: {
    path: path.resolve(__dirname, 'dist/client'),
    filename: '[name].js',
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: babelConfig,
        },
      },
    ],
  },

  plugins: [
    new Dotenv(),
    new HtmlWebpackPlugin({
      title: siteName,
      meta: {
        keywords: keywordsMap.get('App'),
        description: descriptionMap.get('App'),
      },
      filename: path.resolve(__dirname, './dist/client/html/index.html'),
      template: './src/client/html/index.html',
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'assets',
          to: path.resolve(__dirname, 'dist/client/assets'),
        },
        {
          from: path.resolve(__dirname, 'configs', '**/*'),
          to: '[name]',
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
    extensions: ['.js', '.jsx'],
  },

  devServer: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    static: {
      directory: path.join(__dirname, 'dist/client/html'),
    },
    hot: true,
    open: false,
  },
});