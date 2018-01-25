



module.exports = {
    entry: './src/app.js',
    output: {
        path : __dirname,
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.js', '.vue'],
        modules: [
            'node_modules',
            'src'
        ],
        alias: {
            vue: 'vue/dist/vue.common.js'
        }
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                // options: {}
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: { url: false }
                    }
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: { url: false }
                    },
                    'sass-loader'
                ]
            },
            {
                test: /\.(ttf|eot|woff|woff2)$/,
                loader: "url-loader?limit=100000"
            }
        ]
    },

    devtool: 'cheap-module-eval-source-map',
    devServer: {
        clientLogLevel: 'warning',
        contentBase: __dirname, // since we use CopyWebpackPlugin.
        compress: true,
        host: 'localhost',
        port: '8080',
        open: false,
        overlay: { warnings: false, errors: true },
        publicPath:'/',
        quiet: true, // necessary for FriendlyErrorsPlugin
        watchOptions: {
          poll: false,
        }
    },

};