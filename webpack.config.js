const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/game.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    devServer: {
        static: [
            {
                directory: path.join(__dirname, 'dist'),
                publicPath: '/',
                watch: false
            },
            {
                directory: path.join(__dirname, ''),
                publicPath: '/',
                watch: { ignored: ['**/.git/**', '**/*.pb', '**/.cursor/**'] }
            }
        ],
        hot: 'only',
        liveReload: false
    },
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html'
        }),
        new CopyWebpackPlugin({
            patterns: [
                { 
                    from: 'assets',
                    to: 'assets'
                }
            ]
        })
    ]
};
