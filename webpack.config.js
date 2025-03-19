const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');

// Check if public directory exists
const publicDirPath = path.resolve(__dirname, 'public');
const publicDirExists = fs.existsSync(publicDirPath);

// Prepare copy plugin patterns
const copyPatterns = [];

// Only add patterns for existing files to avoid webpack errors
if (publicDirExists) {
  // Check if index.html exists
  const indexHtmlPath = path.join(publicDirPath, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    copyPatterns.push({ 
      from: indexHtmlPath, 
      to: 'index.html' 
    });
  }
  
  // Add any other files from public, but exclude index.html since we handled it specifically
  // This will only run if the directory exists and has files
  const publicFiles = fs.readdirSync(publicDirPath).filter(file => file !== 'index.html');
  if (publicFiles.length > 0) {
    copyPatterns.push({
      from: path.join(publicDirPath, '**/*'),
      to: '[name][ext]',
      globOptions: {
        ignore: ['**/index.html']
      },
      noErrorOnMissing: true  // Don't error if files are missing
    });
  }
}

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/index.js',
  target: 'electron-renderer',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: './'  // Ensures assets are referenced correctly
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    mainFields: ['main', 'module']
  },
  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
  plugins: copyPatterns.length > 0 ? [new CopyWebpackPlugin({ patterns: copyPatterns })] : []
};