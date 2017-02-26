const path = require("path"),
  webpack = require("webpack");
// Karma configuration
// Generated on Sat Oct 03 2015 22:08:48 GMT+0200 (Romance Daylight Time)

module.exports = function (config) {
  var configuration = {

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: ['./build/tests/tests.webpack.js'],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      './build/tests/tests.webpack.js': ["webpack"]
    },

    webpack: {
      output: {
        path: path.resolve("./build"),
        filename: "tests.bundle.js"
      },

      devtool: "source-map",

      module: {
        rules: [{
          test: /.tsx?$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                compilerOptions: {
                  target: "es5",
                  lib: [
                    "es2015",
                    "dom"
                  ]
                }
              }
            }
          ]
        }]
      },

      plugins: [
        new webpack.ProvidePlugin({
          jQuery: 'jquery',
          $: 'jquery',
          jquery: 'jquery'
        })
      ],

      resolve: {
        extensions: [".ts", ".tsx", ".js", ".css"],
      }
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    singleRun: true,

    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
  };

  if (process.env.TRAVIS) {
    configuration.browsers = ['Chrome_travis_ci'];
  }

  config.set(configuration);
}

