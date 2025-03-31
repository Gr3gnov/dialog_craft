// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = [
  // Main process config
  {
    mode: process.env.NODE_ENV || 'development',
    entry: './src/main/main.ts',
    target: 'electron-main',
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist/main')
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: 'ts-loader',
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    node: {
      __dirname: false
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: 'src/main/preload.js', to: './' }
        ],
      }),
    ]
  },

  // Renderer process config
  {
    mode: process.env.NODE_ENV || 'development',
    entry: './src/renderer/index.tsx',
    target: 'electron-renderer',
    output: {
      filename: 'renderer.js',
      path: path.resolve(__dirname, 'dist')
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: 'ts-loader',
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx']
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public/index.html')
      })
    ]
  }
];
