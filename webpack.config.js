const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const NunjucksWebpackPlugin = require('nunjucks-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const purgecssConfig = {
  content: ['**/*.html'],
  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
};

module.exports = (env, argv) => {
  const devMode = argv.mode === 'development';

  return {
    entry: {
      bundle: './src/js/main.js',
      styles: './src/css/main.css'
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'js/[name].js'
    },
    module: {
      rules: [
        // JavaScript
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 }]
              ]
            }
          }
        },
        // CSS
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                url: false,
                import: false,
                importLoaders: 1
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: loader => [
                  require('postcss-import')({ root: loader.resourcePath }),
                  require('tailwindcss'),
                  require('autoprefixer'),
                  ...(devMode
                    ? []
                    : [
                        require('@fullhuman/postcss-purgecss')(purgecssConfig),
                        require('cssnano')()
                      ])
                ]
              }
            }
          ]
        }
      ]
    },
    plugins: [
      ...(devMode ? [] : [new CleanWebpackPlugin()]),
      new NunjucksWebpackPlugin({ templates: [
        { from: 'src/views/index.njk', to: 'index.html' }
      ] }),
      new MiniCssExtractPlugin({ filename: 'css/[name].css' }),
      new FriendlyErrorsWebpackPlugin(),
      new BrowserSyncPlugin({
        host: 'localhost',
        port: 3000,
        server: { baseDir: ['dist'] },
        ignored: /node_modules/,
      })
    ],
    stats: false,
    watchOptions: {
      ignored: /node_modules/
    }
  };
};
