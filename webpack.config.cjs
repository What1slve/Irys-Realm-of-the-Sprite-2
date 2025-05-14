const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './src/script.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/Irys-Realm-of-the-Sprite-2/'
    },
    mode: 'development',

    module: {
        rules: [
            {
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false
                }
            },
            {
                test: /\.(mp3|wav|ogg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'sounds/[name][ext]'
                }
            },
            {
                test: /\.(mp4|gif|mov|MOV)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'images/[name][ext]'
                }
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'images/[name][ext]'
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html'
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        }),
        new webpack.DefinePlugin({
            'process': JSON.stringify({})
        })
    ],
    resolve: {
        fallback: {
            "stream": require.resolve("stream-browserify"),
            "crypto": require.resolve("crypto-browserify"),
            "vm": false,
            "process": require.resolve("process/browser"),
            "buffer": require.resolve("buffer/"),
            util: require.resolve("util/"),
        },
        extensions: ['.js', '.mjs', '.json']
    },
    devServer: {
        static: path.resolve(__dirname, 'dist'),
        port: 8080,
        open: true
    }
};