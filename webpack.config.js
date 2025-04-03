// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin'); // Добавляем плагин

module.exports = {
  mode: 'development',
  entry: './src/renderer/index.js',
  target: 'electron-renderer',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: './'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html')
    }),
    new CopyPlugin({
      patterns: [
        { from: 'public/default_avatar.png', to: 'assets/' } // Копируем в build/assets/
      ],
    })
  ],
  devServer: {
    static: path.join(__dirname, 'build'),
    compress: true,
    port: 3000
  }
};
