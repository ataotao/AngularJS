'use strict';

// Modules
const webpack = require('webpack');
const helpers = require('./webpack/helpers');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const ENV = process.env.npm_lifecycle_event;
// const isTest = ENV === 'test' || ENV === 'test-watch';
const isBuild = ENV === 'build';

module.exports = function () {
  const config = {
    context: helpers.root("./src"),
    entry: {
      'vendor': ['angular', 'angular-ui-router'],
      'app': './app.js'
    },
    output: {
      path: helpers.root('./www'),
      publicPath: '/',
      filename: isBuild ? '[name].[hash:8].js' : '[name].bundle.js',
      chunkFilename: isBuild ? '[name].[hash:8].js' : '[name].bundle.js'
    },
    externals: {
      jQuery: 'window.$'
    },
    module: {
      preLoaders: [{
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: [
          helpers.root('node_modules/angular'),
          helpers.root('node_modules/angular-ui-router')
        ]
      }

      ],

      loaders: [{
        test: /\.js$/,
        loaders: ['babel', 'eslint-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.scss$/,
        exclude: helpers.root("./src/css/main.scss"),
        loader: ExtractTextPlugin.extract("css!postcss!sass")
      },
      {
        test: /\.scss$/,
        include: helpers.root("./src/css/main.scss"),
        loader: 'style!css!postcss!sass'
      },
      // { test: /\.scss$/, loader: "style!css!sass!postcss" },
      {
        test: /\.html$/,
        loader: 'html?root=/&attrs=img:src img:data-src link:href'
      },
      // {
      //   test: /\.(png|jpg)$/, 
      //   loader: 'url?limit=8192'
      // },
      {
        test: /\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i,
        loader: 'url?limit=8192?file?name=images/[name].[ext]?[hash]'
      }
      ]

    },

    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        name: 'commons.chunk',
        chunks: ['app']
      }),
      // new webpack.optimize.CommonsChunkPlugin('vendor', isBuild ? 'vendor.[hash:8].js' : 'vendor.bundle.js'),
      new webpack.optimize.CommonsChunkPlugin('vendor', isBuild ? 'vendor.js' : 'vendor.bundle.js'),
      new HtmlWebpackPlugin({
        template: helpers.root('./src/index.html'),
        //inject        : 'body',
        chunks: ['commons.chunk', 'vendor', 'app'],
        chunksSortMode: 'dependency'
      }),
      new ExtractTextPlugin(isBuild ? '[name].[hash:8].css' : '[name].css')
      // new webpack.ProvidePlugin({
      //     $: 'jquery',
      //     'window.jQuery': 'jquery'
      // })
    ],
    postcss: [
      autoprefixer({
        browsers: ['last 2 version']
      })
    ],

    devServer: {
      contentBase: 'src',
      // 尽量减少输出
      //stats      : 'minimal',
      port: 3000
    }
  };

  if (isBuild) {
    config.plugins.push(
      new webpack.NoErrorsPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin()
    );
  }

  if (isBuild) {
    //config.devtool = 'source-map';
  } else {
    config.devtool = 'source-map';
  }
  // 添加调试信息
  // config.debug = !isBuild || !isTest;
  config.debug = !isBuild;

  return config;
}();