module.exports = function (config) {
  config.set({
    frameworks: ["webpack", "mocha"],
    files: [{ pattern: "*.test.js", watched: false }],
    preprocessors: {
      "*.test.js": ["webpack"],
    },
    browsers: ['Chrome'],
    singleRun: true,
    client: {
      mocha: {
        timeout: 5000
      }
    },
    webpack: {
      mode: "development",
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
                      node: "10",
                    },
                  },
                ],
              ],
            },
          },
        ],
      },
      resolve: {
        mainFields: ["browser", "module", "main"],
      },
      stats: {
        colors: true,
      },
      devtool: "source-map",
      devServer: {
        contentBase: "./build",
      },
    },
    plugins: ["karma-webpack", "karma-mocha", "karma-chrome-launcher"],
  });
};
