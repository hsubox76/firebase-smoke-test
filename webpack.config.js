/**
 * This config is used for the sample app. The tests do not use webpack.
 */
var path = require("path");

module.exports = [
  {
    mode: "development",
    entry: "./app-compat.js",
    output: {
      path: path.resolve(__dirname, "build"),
      filename: "app.bundle.js"
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    node: "10"
                  }
                }
              ]
            ]
          }
        }
      ]
    },
    resolve: {
      mainFields: ["browser", "module", "main"]
    },
    stats: {
      colors: true
    },
    devtool: "source-map",
    devServer: {
      contentBase: "./build"
    }
  }
];
