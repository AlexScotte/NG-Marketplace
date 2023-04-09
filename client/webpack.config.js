const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const EslintWebpackPlugin = require("eslint-webpack-plugin");

const extensions = [".js", ".jsx"];
const Dotenv = require("dotenv-webpack");
module.exports = {
  // plugins: [
  //   new webpack.ProvidePlugin({
  //     process: 'process/browser',
  //   }),
  // ],
  // mode: process.env.NODE_ENV === "production" ? "production" : "development",
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: "./src/index.jsx",
  output: {
    path: path.resolve(__dirname, "build"),
  },
  resolve: {
    extensions,
    // alias: {
    //   process: "process/browser"
    // },
    fallback: {
      assert: require.resolve("assert/"),
      buffer: require.resolve("buffer/"),
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      url: require.resolve("url/"),
      // "os": require.resolve("os-browserify/browser"),
      // "path": require.resolve("path-browserify"),
      fs: false,
      os: false,
      path: false,
    },
  },
  devServer: {
    client: {
      overlay: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/i,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [["@babel/preset-react", { runtime: "automatic" }]],
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new Dotenv(),
    new EslintWebpackPlugin({ extensions }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      favicon: "./public/favicon.ico",
    }),
  ],
  stats: "minimal",
};
