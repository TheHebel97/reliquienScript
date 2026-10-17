const path = require('path');

module.exports = {
  mode: 'development',  // Set mode to 'development' for easier debugging
  entry: './src/index.ts',  // Entry point for the application (your main TypeScript file)
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']  // Resolve file extensions for imports
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')  // Output directory for the bundled JavaScript file
  },
  watchOptions: {
    aggregateTimeout: 100,
    ignored: /node_modules/,
    poll: 300
  },

  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },

    compress: true,
    client: false,
    webSocketServer: false,
    port: 9001,
    host: "127.0.0.1"
  },
};
