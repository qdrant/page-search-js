const path = require('path');

module.exports = [
  {
    entry: {
      search: './src/js/search.js',
      scroll: './src/js/result-scroll.js',
    },
    output: {
      path: path.resolve(__dirname, 'dist/js'),
      filename: '[name].min.js'
    },
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