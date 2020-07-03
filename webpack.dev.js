//const webpack = require('webpack');
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const mode = process.env.NODE_ENV || "development";

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
			},
			{
				test: /\.css$/,
				exclude: /node_modules/,
				use: [
					{ loader: MiniCssExtractPlugin.loader },
					"css-loader"
				]
			},
			{
				test: /\.(png|svg|jpe?g|gif)$/i,
				loader: 'file-loader',
				options: {
					name: 'img/[name].[ext]',
					publicPath: '../',
				},
			},
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

function TransformPackageJson(content, absoluteFrom) {
	try {
		let
			json = JSON.parse(content),
			output = {},
			copyProps = [
				"name", "author", "version", "description", "license", "productName", "homepage",
				"bugs", "repository", "keywords"
			];
		copyProps.forEach(p => output[p] = json[p]);
		output.main = "./main.js";
		return JSON.stringify(output, null, "\t")
	}
	catch (e) { return content }
}

module.exports = env => {
	commonConfig.mode = env.mode;
	console.log('enviriment: ', env.mode)
	
	return [
		Object.assign(
			{
				target: 'electron-main',
				entry: { main: './src/main.ts' },
				plugins: [
					new CopyPlugin({
						patterns: [
							{
								from: './package.json', to: 'package.json', transform(content, absoluteFrom) {
									return TransformPackageJson(content, absoluteFrom);
								}
							},
							{ from: './LICENSE', to: 'LICENSE', toType: 'file' },
						]
					})
				]
			},
			commonConfig),
		Object.assign(
			{
				target: 'electron-renderer',
				entry: {
					index: ['./src/index.ts', './src/css/circuits.css', './src/css/windows.css', './src/css/svg.css']
				},
				plugins: [
					new MiniCssExtractPlugin({
						filename: "css/[name].bundle.css"
					}),
					new HtmlWebpackPlugin({
						//hash: true,
						title: 'Electronic Circuits',
						myPageHeader: 'Hello World',
						template: './src/html/index.html',
						filename: 'html/index.html'
					}),
					new CopyPlugin({
						patterns: [
							{ from: './src/css/purecss.min.css', to: 'css/purecss.min.css' },
							{ from: './src/html/favicon.ico', to: 'html/favicon.ico' },
							{ from: './src/data/context-menu.json', to: 'data/context-menu.json' },
							{ from: './src/data/library-circuits.v2.json', to: 'data/library-circuits.v2.json' },
							{ from: './src/img/rot-left-16x16-p2.png', to: 'img/rot-left-16x16-p2.png' },
							{ from: './src/img/rot-right-16x16-p2.png', to: 'img/rot-right-16x16-p2.png' },
						]
					}),
				],
			},
			commonConfig),
		Object.assign(
			{
				target: 'electron-renderer',
				entry: {
					print: ['./src/index.print.ts', './src/css/svg.css', './src/css/windows.css', './src/css/print.css']
				},
				plugins: [
					new MiniCssExtractPlugin({
						filename: "css/[name].bundle.css"
					}),
					new HtmlWebpackPlugin({
						//hash: true,
						title: 'Print Circuit',
						template: './src/html/print.html',
						filename: 'html/print.html'
					}),
				],
			},
			commonConfig),
		Object.assign(
			{
				target: 'electron-renderer',
				entry: {
					help: ['./src/index.help.ts', './src/css/help.css']
				},
				plugins: [
					new MiniCssExtractPlugin({
						filename: "css/[name].bundle.css"
					}),
					new HtmlWebpackPlugin({
						//hash: true,
						title: 'Circuit Help',
						template: './src/html/help.html',
						filename: 'html/help.html'
					}),
				],
			},
			commonConfig),
	];
}