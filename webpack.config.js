const path = require('path')
// 自动生成html文件
const HtmlWebpackPlugin = require('html-webpack-plugin')
// 抽离css 插件
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// 压缩css
const OptimizeCssAssets = require('optimize-css-assets-webpack-plugin')
// 压缩js
const UglifyjsPlugin = require('uglifyjs-webpack-plugin')
// 引入webpack插件
const webpack = require('webpack')

module.exports = {
  // 模式
  mode: 'development',
  // 入口
  entry: './src/index.js',
  // 出口
  output: {
    // 配置hash, 当源文件修改时, 让每次打包后对应的文件名都不一样, 防止缓存.
    filename: 'bundle[hash:8].js',
    path: path.resolve(__dirname, 'dist')
  },
  // 开发服务器配置, 启动开发服务器时, 并不会真正的打包, 而是把打包后的代码写入内存中, 然后运行
  devServer: {
    // 告诉dev-server 从哪里开始查找文件
    contentBase: path.join(__dirname, 'dist'),
    // 是否显示进度条
    progress: true,
    // 是否 gzip 压缩
    compress: true,
    // 端口设置
    port: 8080
  },
  // 插件
  plugins: [
    // 作用: 打包或者启动开发服务器时, 在dist文件下自动创建html文件, 并且自动创建script标签来引入js模块
    new HtmlWebpackPlugin({
      // 模板的位置
      template: './src/index.html',
      // 模板打包后的文件名
      filename: 'index.html',
      // 模板打包压缩时的配置
      minify: {
        // 移除html中属性的双引号
        removeAttributeQuotes: true,
        // 折叠空行
        collapseWhitespace: true,
      },
      // 引入模块时加入哈希戳
      hash: true
    }),
    // 抽离 css
    new MiniCssExtractPlugin({
      filename: 'main.css'
    }),
    // 把jquery的$符注入到每个模块中
    // new webpack.ProvidePlugin({
    //   // 把第三方库注入到每个模块中
    //   $: 'jquery'
    // })
  ],
  // 模块
  module: {
    // 解析规则
    rules: [
      // eslint校验
      {
        test: /\.js$/,
        use: {
          loader: 'eslint-loader',
          options: {
            // 强制顺序
            enforce: 'pre'
          }
        },
        include: path.resolve(__dirname, 'dist'),
        exclude: /node_modules/
      },
      // 转化es6
      {
        test: /\.js$/,
        use: {
          // 把es6 转化为 es5
          loader: 'babel-loader',
          // loader 的配置
          options: {
            // 预设, preset 才会把es6 转化为 es5, babel-loader只是一个加载器
            presets: ['@babel/preset-env'],
            // 转化es7 class语法, 转化js高级语法(不包含实例上的方法),  转化实例上的方法需要用到@babel/polify,且是生产依赖
            plugins: ['@babel/plugin-proposal-class-properties', '@babel/plugin-transform-runtime']
          }
        },
        include: path.resolve(__dirname, 'src'),
        // 忽略的文件夹
        exclude: /node-modules/
      },
      // 解析css, 工具: style-loader, css-loader
      {
        // 检测
        test: /\.css$/,
        // css-loader: 用来加载 @import这种语法的模块依赖. style-loader: 作用是把 css 插入到 head 标签中
        // loader 一个loader为字符串, 多个loadner使用数组形式
        // 注意, 在数组中, loader是有顺序的, 默认是从右往左执行
        use: [
          // {
          //   loader: 'style-loader',
          //   // loader 配置
          //   options: {
          //     // 把 style 标签插入到head标签的顶部, 默认从底部插入
          //     insertAt: 'top'
          //   }
          // },
          // 把抽离出来的css文件放入link标签中
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      // 解析less, 工具: less, less-loader, css-loader, style-loader
      // sass: node-sass, sass-loader
      // stylus: stylus, stylus-loader
      {
        test: /\.less$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'less-loader']
      }
    ]
  },
  optimization: {
    // 最小化
    minimizer: [
      // 压缩js
      new UglifyjsPlugin({
        // 是否缓存
        // cache: true,
        // 是否并行压缩
        parallel: true,
        // 是否源码映射
        sourceMap: true
      }),
      // 用了这个压缩css插件后, 必须在上面使用压缩js的插件uglifyjs-webpack-plugin, 否则js不会被压缩
      new OptimizeCssAssets({})
    ]
  },
  // 引入模块后, 在引入后只引入一次
  externals: {
    jquery: '$'
  }
}