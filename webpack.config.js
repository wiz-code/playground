const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const babelConfig = require('./src/babelrc');

const json = fs.readFileSync('./src/common.json', 'utf-8');
const { Meta } = JSON.parse(json);

const meta = new Map(Meta);
const siteName = meta.get('siteName');
const Keywords = meta.get('keywords');
const Description = meta.get('description');
const keywordsMap = new Map(Keywords);
const descriptionMap = new Map(Description);

module.exports = (env, arg) => ({
  mode: 'development',

  devtool: 'inline-source-map',

  stats: {
    errorDetails: true,
  },

  entry: {
    app: './src/index.jsx',
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
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
    new HtmlWebpackPlugin({
      title: siteName,
      meta: {
        keywords: keywordsMap.get('App'),
        description: descriptionMap.get('App'),
      },
      template: './src/html/index.html',
    }),
    new CopyPlugin({
      patterns: [
        path.resolve(__dirname, 'assets', '**/*'),
      ],
    }),
  ],

  optimization: {
    minimize: false,
    minimizer: [
      new TerserPlugin(),
    ],
  },

  resolve: {
    extensions: ['.js', '.jsx'],
  },

  devServer: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    static: {
      directory: path.join(__dirname, 'assets'),
      publicPath: '/assets',
    },
    hot: true,
    open: false,
  },
});