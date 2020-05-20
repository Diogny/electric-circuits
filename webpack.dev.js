const webpack = require('webpack');
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
//var Comp = require('./lib/components').default;
//console.log(Comp);

console.log('webpack __dirname', __dirname);

const commonConfig = {
	node: {
		__dirname: true
	},
	output: {
		path: path.resolve(__dirname, 'dist'), // __dirname, //
		filename: '[name].js',
	},
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.ts(x)?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		plugins: [new TsconfigPathsPlugin({ /*configFile: "./path/to/tsconfig.json" */ })],
		alias: {
			components: path.resolve(process.cwd(), 'src/'),
		},
		extensions: ['.js', '.ts', '.tsx', '.jsx', '.json']
	}
}

module.exports = module.exports = [
	Object.assign(
		{
			target: 'electron-main',
			entry: { index: './index.ts' }
		},
		commonConfig),
	Object.assign(
		{
			target: 'electron-renderer',
			entry: { renderer: './renderer.ts' }
		},
		commonConfig),
];
