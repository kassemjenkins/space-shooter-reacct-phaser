const webpack = require('webpack');
const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {

    entry: './src/index.js',

    output: {
        path: path.resolve(__dirname, 'build'),
        publicPath: '/build/',
        filename: 'bundle.js',
        clean: true,
    },

    module: {
        rules: [
            {
                test: [ /\.vert$/, /\.frag$/ ],
                use: 'raw-loader'
            },
            {
                test: /\.jsx?$/,
                loader: "babel-loader",
                options: {
                    "presets": ["@babel/preset-react"]
                }
            },
            {
                test: /\.(png|mp3)$/i,
                type:'asset/resource',
                use: [
                    { 
                        loader: 'url-loader',
                        options: {
                            limit: true,
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new Dotenv(),
        new webpack.DefinePlugin({
            'CANVAS_RENDERER': JSON.stringify(true),
            'WEBGL_RENDERER': JSON.stringify(true)
        })
    ],
    devServer: {
        'static': {
            directory: './dist'
        }
    }

};