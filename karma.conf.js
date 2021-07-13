function getTestFilePattern(argv) {
  let pattern = "./tests/*.test.ts";
  if (argv.includes("--compat")) {
    pattern = "./tests/compat.test.ts";
  } else if (argv.includes("--exp")) {
    pattern = "./tests/exp.test.ts";
  }
  return pattern;
}

module.exports = function (config) {
  config.set({
    frameworks: ["karma-typescript", "mocha"],
    files: [{ pattern: getTestFilePattern(process.argv), watched: false }],
    preprocessors: {
      "./tests/*.test.ts": ["karma-typescript"],
    },
    browsers: ["Chrome"],
    singleRun: true,
    client: {
      mocha: {
        timeout: 5000,
      },
    },
    customContextFile: './context.html',
    reporters: ["spec"],
    specReporter: {
      maxLogLines: 5,         // limit number of lines logged per test
      suppressErrorSummary: true,  // do not print error summary
      suppressFailed: false,  // do not print information about failed tests
      suppressPassed: false,  // do not print information about passed tests
      suppressSkipped: true,  // do not print information about skipped tests
      showSpecTiming: false // print the time elapsed for each spec
    },
    concurrency: 1,
    karmaTypescriptConfig: {
      bundlerOptions: {
        resolve: {
          alias: {
            '@firebase/messaging/sw': 'node_modules/@firebase/messaging/dist/index.sw.esm2017.js'
          },
        },
        transforms: [
          require("karma-typescript-es6-transform")({
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    browsers: ["last 2 Chrome versions"],
                  },
                },
              ],
            ],
          }),
        ],
      },
      compilerOptions: {
        allowJs: true,
      },
    },
    plugins: [
      "karma-typescript",
      "karma-mocha",
      "karma-chrome-launcher",
      "karma-spec-reporter",
    ],
  });
};
