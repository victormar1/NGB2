const path = require('path');

module.exports = {
    mode: 'development', // Changez en 'production' pour un build final
    target: 'electron-main',
    entry: {
        preload: './src/preload/preload.js', // Entrée pour le fichier preload
        renderer: './src/renderer/renderer.js', // Entrée pour le renderer principal
    },
    output: {
        filename: '[name].bundle.js', // Génère preload.bundle.js et renderer.bundle.js
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            '@main': path.resolve(__dirname, 'src/main/'),
            '@renderer': path.resolve(__dirname, 'src/renderer/'),
        },
    },
};
