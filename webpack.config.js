const path = require('path');

module.exports = function (env, argv) {

  const isEnvDevelopment = argv.mode === 'development';
  const isEnvProduction = argv.mode === 'production';

  return {
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    context: __dirname,
    entry: {
      search: './src/js/index.js',
      scroll: './src/js/result-scroll.js',
      styles: './src/scss/styles.scss',
    },
    output: {
      path: path.resolve(__dirname, './dist/js'),
      publicPath: './dist/js/',
      filename: '[name].min.js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env',]
            }
          }
        },

        {
          test: /\.scss$/,
          exclude: /node_modules/,

          type: 'asset/resource',
          generator: {
            filename: '../css/[name].min.css'
          },

          use: [
            "sass-loader",
          ]
        },

        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: "[name].[ext]",
                outputPath: '../images/',
                publicPath: path.resolve(__dirname, './images/'),
              }
            },
          ],
        },
      ],
    },
    devServer: {
      static: {
        directory: './',
      },
      port: 9000,
      hot: true,
      devMiddleware: {
        index: true,
        mimeTypes: { phtml: 'text/html' },
        publicPath: '/',
        serverSideRender: true,
        writeToDisk: true,
      },
    },
    watchOptions: {
      poll: true,
      ignored: /node_modules/
    },
    cache: false,
  };
}