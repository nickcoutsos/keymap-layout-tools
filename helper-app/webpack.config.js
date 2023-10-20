const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { SourceMapDevToolPlugin } = require('webpack')

module.exports = {
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ],
        exclude: /\.module\.css$/
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true
            }
          }
        ],
        include: /\.module\.css$/
      },
      {
        test: /tree-sitter-devicetree\.wasm$/,
        type: 'asset/resource'
      },
      {
        test: /tree-sitter-json\.wasm$/,
        type: 'asset/resource'
      },
      // Taken from https://github.com/zmkfirmware/zmk/blob/c065d451cb82e2dceda4efdb2991aeeeef1cdbbf/docs/src/docusaurus-tree-sitter-plugin/index.js#L24
      {
        test: /tree-sitter\.js$/,
        loader: 'string-replace-loader',
        options: {
          multiple: [
            // Replace the path to tree-sitter.wasm with a "new URL()" to clue
            // Webpack in that it is an asset.
            {
              search: '"tree-sitter.wasm"',
              replace: '(new URL("tree-sitter.wasm", import.meta.url)).href',
              strict: true
            },
            // Webpack replaces "new URL()" with the full URL to the asset, but
            // web-tree-sitter will still add a prefix to it unless there is a
            // Module.locateFile() function.
            {
              // Note: in an earlier version this pattern ends with "," not ";"
              search: 'var Module=void 0!==Module?Module:{},',
              replace: `var Module = {
                locateFile: (path, prefix) => path.startsWith('http') ? path : prefix + path,
              },`,
              strict: true
            }
          ]
        }
      }
    ]
  },
  devServer: {
    static: {
      directory: './dist'
    },
    port: 3000
  },
  plugins: [
    new SourceMapDevToolPlugin({
      filename: '[file].map[query]'
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      filename: 'index.html'
    })
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  resolve: {
    fallback: {
      assert: false,
      fs: false,
      path: false
    }
  }
}
