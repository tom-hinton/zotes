const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const outputDirectory = 'dist'

module.exports = {
	mode: 'development',
	entry: ['@babel/polyfill', './src/index.js'],
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, outputDirectory)
	},
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader'
      }
    },
    {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    },
    {
      test: /\.(png|woff|woff2|eot|ttf|svg)$/,
      use: {
			loader: 'url-loader?limit=100000'
		}
	},
	{
		test: /\.js$/,
		enforce: "pre",
		use: ["source-map-loader"],
	}]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
	devServer: {
		contentBase: './dist',
		port: 1212,
		historyApiFallback: true,
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			title: 'Zotes'
		})
 	]
}