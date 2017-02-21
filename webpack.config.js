const path = require("path"),
    webpack = require("webpack");

module.exports = {
    entry: {
        "main": "./src/main/app/startup.ts"
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "build"),
        publicPath: "./build/"
    },
    devtool: "source-map",
    resolve: { extensions: [".ts", ".tsx", ".js", ".css"] },
    module: {
        rules: [{
            test: /.tsx?$/,
            use: [
                {
                    loader: "ts-loader"
                }
            ]
        },
        {
            test: /\.s?css$/,
            use: [{
                loader: "style-loader" // creates style nodes from JS strings
            }, {
                loader: "css-loader" // translates CSS into CommonJS
            }, {
                loader: "sass-loader" // compiles Sass to CSS
            }]
        }]
    },
    plugins: [
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: 'jquery',
            jquery: 'jquery'
        })
    ]
}