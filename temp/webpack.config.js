const { merge } = require("webpack-merge");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const commonConfig = merge([
  {
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "./build"),
      filename: "bundle.js",
      publicPath: "/", // Изменено на '/' 
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          use: "html-loader" // для обработки html файлов
        },
        {
          test: /\.(png|jpe?g|gif|svg|ico)$/,
          type: 'asset/resource' // Вместо file-loader, начиная с Webpack 5
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        // Вы можете добавить другие правила для обработки файлов
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./index.html", // Укажите ваш шаблон HTML
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, "public"), // Укажите свою папку со статическими файлами
      },
      compress: true,
      port: 9000, // Задайте порт, который вы хотите использовать
      historyApiFallback: true, // Позволяет использовать маршрутизацию через HTML5 History API
      watchFiles: ['src//*'], // Подписывайтесь на изменения в файлах
    },
  }
]);
module.exports = commonConfig;



// const { merge } = require("webpack-merge");
// const path = require("path");
// // const parts = require("./webpack.parts");
// // const CopyWebpackPlugin = require("copy-webpack-plugin");
// const HtmlWebpackPlugin = require("html-webpack-plugin");


// const commonConfig = merge([
//   {
//     entry: ["./src/index.js"],
//     output: {
//       path: path.resolve(__dirname, "./build"),
//       filename: "bundle.js",
//       publicPath: '/public', // Пути к статическим файлам
//     },
//     devServer: {
//       watchFiles: ['src/**/*'],
//       static: {
//         directory: path.join(__dirname, '/public'), // Укажите свою папку со статическими файлами
//       },
//       compress: true,
//       historyApiFallback: true, // Позволяет использовать маршрутизацию через HTML5 History API
//     },
//     plugins: [
//       new HtmlWebpackPlugin({ template }),
//       // new CopyWebpackPlugin({
//       //   patterns: [
//       //     {
//       //       from: path.resolve(__dirname, "public"),
//       //       to: path.resolve(__dirname, "./build/public")
//       //     },
//       //   ]
//       // })
//     ],
//     module: {
//       rules: [
//         {
//           test: /\.html$/i,
//           loader: "html-loader",
//         },
//         {
//           test: /\.css$/i,
//           use: ["style-loader", "css-loader"],
//         },
//         {
//           test: /\.(png|svg|jpg|jpeg|gif)$/i,
//           type: "asset/resource",
//         },
//         {
//           test: /\.js$/,
//           exclude: /node_modules/,
//           use:
//             [
//               'babel-loader'
//             ]
//         },
//       ],
//     },
//   },
//   // parts.loadHTML(),

//   // parts.generateHTML({ template: "./index.html" }),
//   // parts.loadCSS(),
//   // parts.loadImages(),
//   // parts.loadJavaScript(),
// ]);

// const configs = {
//   development: merge([]),
//   production: merge([]),
// };

// module.exports = (_, argv) => merge([commonConfig, configs[argv.mode], { mode: argv.mode }]);