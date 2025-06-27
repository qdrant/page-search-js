import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function (_env, argv) {
  const isEnvDevelopment = argv.mode === 'development';
  const isEnvProduction = argv.mode === 'production';

  return {
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    context: __dirname,
    entry: {
      search: './src/js/index.js',
      scroll: './src/js/result-scroll.js',
      // styles: './src/scss/styles.scss',
    },
    output: {
      path: path.resolve(__dirname, './dist/js'),
      publicPath: './dist/js/',
      filename: '[name].min.js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },

        {
          test: /\.scss$/,
          exclude: /node_modules/,

          type: 'asset',

          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'resolve-url-loader',
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },

        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/inline',
        },
      ],
    },
    devServer: {
      static: {
        directory: path.resolve(__dirname, './'),
      },
      port: 9000,
      hot: true,
    },
    watchOptions: {
      poll: true,
      ignored: /node_modules/,
    },
    cache: false,
    plugins: [new MiniCssExtractPlugin({ filename: '../css/styles.min.css' })],
  };
}
