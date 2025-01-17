const { merge } = require("webpack-merge");
const path = require("path");
const parts = require("./webpack.parts");
const CopyWebpackPlugin = require("copy-webpack-plugin")


const commonConfig = merge([
  {
    entry: ["./src/index.js"],
    output: {
      path: path.resolve(__dirname, "./build"),
      filename: "bundle.js",
    },
    devServer: { watchFiles: ['src/**/*'] },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "public"),
            to: path.resolve(__dirname, "./build/public")
          },
        ]
      })
    ],
  },
  parts.loadHTML(),

  parts.generateHTML({ template: "./index.html" }),
  parts.loadCSS(),
  parts.loadImages(),
  parts.loadJavaScript(),
]);

const configs = {
  development: merge([]),
  production: merge([]),
};

module.exports = (_, argv) => merge([commonConfig, configs[argv.mode], { mode: argv.mode }]);
