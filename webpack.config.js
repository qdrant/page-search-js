const path = require('path');

module.exports = [
  {
    mode: "none",
    entry: {
      search: './src/js/index.js',
      scroll: './src/js/result-scroll.js',
    },
    output: {
      path: path.resolve(__dirname, 'dist/js'),
      filename: '[name].min.js'
    },
    module: {
      rules: [{
        "test": /\.js$/,
        "exclude": /node_modules/,
        "use": {
          "loader": "babel-loader",
          "options": {
            "presets": ["@babel/preset-env",]
          }
        }
      }]
    }
  }, {
    entry: './src/scss/styles.scss',
    output: {
      path: path.resolve(__dirname, 'dist/css'),
    },
    module: {
      rules: [
        {
          test: /\.s[ac]ss$/i,
          use: [
            {
              loader: 'file-loader',
              options: {outputPath: './', name: '[name].min.css'}
            },
            'sass-loader'
          ],
        },
      ],
    },
  }
];