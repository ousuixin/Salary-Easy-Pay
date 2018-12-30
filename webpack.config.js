const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require('path');
module.exports = {
  devtool: 'eval-source-map',

  entry: {
    employer: __dirname + "/app/js/employer.js",
    index: __dirname + "/app/js/index.js",
    introduction: __dirname + "/app/js/introduction.js",
    employee: __dirname + "/app/js/employee.js"
  },
  output: {
    path: __dirname + "/build",
    filename: "[name]-[hash].bundle.js"
  },
  devServer: {
    contentBase: "./build",//本地服务器所加载的页面所在的目录
    historyApiFallback: true,//不跳转
    inline: true//实时刷新
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader"
          },{
            loader: "css-loader"
          }
        ]
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: true }
          }
        ]
      },
      {
        test: /\.png$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./app/employer.html",
      filename: "./employer.html",
      chunks: ['employer']
    }),
    new HtmlWebPackPlugin({
      template: "./app/index.html",
      filename: "./index.html",
      chunks: ['index']
    }),
    new HtmlWebPackPlugin({
      template: "./app/introduction.html",
      filename: "./introduction.html",
      chunks: ['introduction']
    }),
    new HtmlWebPackPlugin({
      template: "./app/employee.html",
      filename: "./employee.html",
      chunks: ['employee']
    })
  ]
};