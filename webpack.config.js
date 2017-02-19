const path = require("path");

module.exports = {
    entry : {
        "main" : "src/main/app/startup.ts"
    },
    resolve : [".ts", ".tsx", ".js"],
    loaders: [{
        test : /.tsx?$/,
        loader : "ts-loader"
    }]
}