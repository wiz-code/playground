const path = require('node:path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
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
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },

  plugins: [
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
    extensions: ['.js', 'cjs', 'mjs'],
  },
});