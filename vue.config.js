const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path')
const ExtensionReloader = require('webpack-ext-reloader')

const isDev = process.env.NODE_ENV === 'development'
// copy file to dist
const copyFiles = [
  {
    from: path.resolve('src/manifest.json'),
    to: path.resolve("dist")
  },
  {
    from: path.resolve('assets'),
    to: path.resolve('dist/assets'),
  },
  // {
  //   from: path.resolve('src/inject'),
  //   to: path.resolve("dist/inject")
  // },
]

// dev hot reload
// https://github.com/SimplifyJobs/webpack-ext-reloader
const hotReload = isDev
  ? [
    new ExtensionReloader({
      reloadPage: true,
      port: 9091,
      manifest: path.resolve(__dirname, 'src/manifest.json'),
    }),
  ]
  : []

module.exports = {
  productionSourceMap: false,
  devServer: {
    port: 9999
  },
  pages: {
    popup: {
      entry: `src/popup/index.js`,
      template: `src/pages/popup.html`,
      filename: `pages/popup.html`
    },
    options: {
      entry: `src/options/index.js`,
      template: `src/pages/options.html`,
      filename: `pages/options.html`
    }
  },
  configureWebpack: {
    mode: isDev ? 'development' : 'production',
    entry: {
      // content: "./src/content/index.js",
      background: "./src/background/index.js"
    },
    output: {
      filename: '[name].js'
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: copyFiles
      }),
      ...hotReload
    ],
  },
  css: {
    extract: false
  },
  chainWebpack: config => {
    config.optimization.delete('splitChunks')
  }
}
