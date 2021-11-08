const path = require('path');

module.exports = {
  entry: './src/index.ts',
  target: 'node',
  mode: 'development',
  watch: true,
  watchOptions: {
      aggregateTimeout: 200,
      poll: 100
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../dist'),
  },
  node: {
    global: false,
    __filename: false,
    __dirname: false,
  }
};