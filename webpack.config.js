const path = require("path");

module.exports = [
  {
    mode: "production",
    module: {
      rules: [
        {
          test: /\.js$/,
          use: "babel-loader",
          exclude: path.resolve(__dirname, "node_modules")
        }
      ]
    },
    entry: "./src/Public.js",
    externals: {
      react: "react",
      "react-router-dom": "react-router-dom"
    },
    output: {
      path: path.resolve(__dirname),
      filename: "index.js",
      library: "typed-view",
      libraryTarget: "umd",
      sourceMapFilename: "[file].map"
    },
    devtool: "source-map",
    optimization: {
      minimize: true
    }
  },
  {
    mode: "production",
    module: {
      rules: [{ test: /\.js$/, use: "babel-loader" }]
    },
    entry: "./src/Public.js",
    externals: {
      react: "react",
      "react-router-dom": "react-router-dom"
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "typed-view.js",
      library: "typed-view",
      libraryTarget: "umd",
      sourceMapFilename: "[file].map"
    },
    devtool: "source-map"
  }
];
