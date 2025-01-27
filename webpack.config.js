const { merge } = require("webpack-merge");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const commonConfig = merge([
  {
    entry: "./src/index.ts",
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
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
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
      // port: 9000, // Задайте порт, который вы хотите использовать
      historyApiFallback: true, // Позволяет использовать маршрутизацию через HTML5 History API
      watchFiles: ['src//*'], // Подписывайтесь на изменения в файлах
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    stats: {
      children: true, // Включаем детальную информацию о дочерних компиляциях
    },
  }
]);
module.exports = commonConfig;
