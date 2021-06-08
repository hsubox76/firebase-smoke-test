module.exports = function (config) {
  config.set({
    frameworks: ["karma-typescript", "mocha"],
    files: [{ pattern: "*.test.ts", watched: false }],
    preprocessors: {
      "*.test.ts": ["karma-typescript"],
    },
    browsers: ["Chrome"],
    singleRun: true,
    client: {
      mocha: {
        timeout: 5000,
      },
    },
    concurrency: 1,
    karmaTypescriptConfig: {
      bundlerOptions: {
        transforms: [require("karma-typescript-es6-transform")({
          presets: [
           ["@babel/preset-env", {
            targets: {
             browsers: ["last 2 Chrome versions"]
            }
           }]
          ]
        })],
      },
      compilerOptions: {
        allowJs: true,
      },
    },
    plugins: ["karma-typescript", "karma-mocha", "karma-chrome-launcher"],
  });
};
