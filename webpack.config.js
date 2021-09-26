const HtmlWebPackPlugin = require('html-webpack-plugin'),
      MiniCssExtractPlugin = require('mini-css-extract-plugin'),
      HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin'),
      ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');

const webpack = require('webpack')

module.exports = {
    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/index.html",
            filename: "./index.html",
            inject: 'head'
        }),
        new MiniCssExtractPlugin({
            filename: "style.css",
            chunkFilename: "[id].css"
        }),
        new ExtraWatchWebpackPlugin({
            files: ['src/js/logo.js'],
            dirs: ['src/js']
        })
        
    ],
    module: {
        rules: [
            {
               
                test: require.resolve('jquery'),
                use: [{
                  loader: 'expose-loader',
                  options: 'jQuery'
                },{
                  loader: 'expose-loader',
                  options: '$'
                },
                {
                    loader: 'expose-loader',
                    options: 'window.$'
                }
            ]
              },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    
                }
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: { 
                            minimize: true,
                            collateWhitespace: false
                        }
                    }
                ],
                
            },
            {
                test: /\.scss$/,
                use: [
                    "style-loader",
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "resolve-url-loader",
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                            sourceMapContents: false
                    }
                    }
                    
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use:{
                    loader: 'file-loader'}
                    
            }
        ]
    }
}