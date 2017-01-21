开发环境安装
---------------
    npm install --save-dev autoprefixer babel-core babel-loader babel-preset-es2015 css-loader eslint eslint-loader extract-text-webpack-plugin file-loader html-loader html-webpack-plugin json-loader postcss-loader raw-loader rimraf source-map-loader style-loader webpack webpack-dev-server sass-loader

    cnpm install --save-dev node-sass

生产环境安装
----------------
    npm install --save angular-ui-router angular bootstrap 

- rimraf 使用npm卸载插件
    npm install rimraf -g 用法：rimraf node_modules  

- extract-text-webpack-plugin ExtractTextPlugin：分离CSS和JS文件
    npm install --save-dev extract-text-webpack-plugin

- HtmlWebpackPlugin 依据一个简单的模板，帮你生成最终的Html5文件，这个文件中自动引用了你打包后的JS文件。每次编译都在文件名中插入一个不同的哈希值。
    npm install --save-dev html-webpack-plugin


###### new webpack.optimize.DedupePlugin()
- 如果你使用了一些有着很酷的依赖树的库，那么它可能存在一些文件是重复的。webpack可以找到这些文件并去重。这保证了重复的代码不被大包到bundle文件里面去，取而代之的是运行时请求一个封装的函数。不会影响语义：

--optimize-dedupe
------
        new webpack.optimize.DedupePlugin()
        这个功能可能会增加入口模块的一些花销

######NoErrorsPlugin new webpack.NoErrorsPlugin()

- 跳过编译时出错的代码并记录，使编译后运行时的包不会发生错误。


######[loaders用法](https://segmentfault.com/a/1190000005742111)


loaders之 预处理
---------------
- webpack提供两个工具处理样式表，css-loader 和 style-loader，二者处理的任务不同，
- css-loader使你能够使用类似@import 和 url(...)的方法实现 require()的功能,
- style-loader将所有的计算后的样式加入页面中，二者组合在一起使你能够把样式表嵌入webpack打包后的JS文件中。

- css-loader 处理css中路径引用等问题
- style-loader 动态把样式写入css
- sass-loader scss编译器
    npm install sass-loader node-sass webpack --save-dev
    var css = require("!raw-loader!sass-loader!./file.scss");
    // returns compiled css code from file.scss, resolves Sass imports
    var css = require("!css-loader!sass-loader!./file.scss");
    // returns compiled css code from file.scss, resolves Sass and CSS imports and url(...)s
    Use in tandem with the style-loader and css-loader to add the css rules to your document:

    require("!style-loader!css-loader!sass-loader!./file.scss");

- less-loader less编译器
- postcss-loader scss再处理  可以使用PostCSS来为CSS代码自动添加适应不同浏览器的CSS前缀。

    npm install --save-dev postcss-loader autoprefixer

    npm install --save-dev css-loader style-loader sass-loader less-loader postcss-loader

    module: {
      loaders: [
        {test: /\.css$/, loader: "style!css?sourceMap!postcss"},
        {test: /\.less$/, loader: "style!css!less|postcss"},
        {test: /\.scss$/, loader: "style!css!sass|postcss"}
      ]
    }

    
        {
            test: /\.scss$/,
            loader: 'style!css?modules&importLoaders=2&sourceMap&localIdentName=[local]___[hash:base64:5]!autoprefixer?browsers=last 2 version!sass?outputStyle=expanded&sourceMap'
        }


loaders之 js处理
---------------

- babel-loader
- jsx-loader

    npm install --save-dev babel-core babel-preset-es2015 babel-loader jsx-loader

- 新建一个名字为.babelrc的文件

    {
      "presets": ["es2015","react"],
      "plugins":["antd"]
    }

- 新建一个名字为webpack.config.js文件

    module.exports = {
      entry: './entry.js',
      output: path: __dirname,
      filename: 'bundle.js'
    },
    module: {
      loaders: [
        {test: /\.js$/, loader: "babel", exclude: /node_modules/},
        {test: /\.jsx$/, loader: "jsx-loader"}
        {test: /.css$/, loader: 'style!css'} 
        ]
      }
    };

loaders之 图片处理
-----------------
- url-loader url-loader是对file-loader的上层封装，比如webpack中对图片的加载器配置
- 这样在小于8K的图片将直接以base64的形式内联在代码中，可以减少一次http请求。

    {test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'}

    npm install --save-dev url-loader

    module: {
      loaders: [
        {test: /\.(jpg|png)$/, loader: "url?limit=8192"},
      ]
    }

loaders之 文件处理
-------------------
- file-loader
    npm install --save-dev file-loader

    module: {
      loaders: [
        {
          test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
          loader: 'file'
          },
      ]
    }

loaders之 json处理
-------------------
- json-loader
    npm install --save-dev json-loader

    module: {
      loaders: [
        {test: /\.json$/,loader: 'json'},
      ]
    }

loaders之 html处理
-------------------
- raw-loader
    npm install --save-dev raw-loader

    module: {
      loaders: [
        { test: /\.html$/,loader: 'raw'},
      ]
    }

    {test: /\.html$/, loader: 'raw'},