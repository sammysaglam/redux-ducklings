const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const isProduction = process.argv.indexOf('-p') !== -1;

const plugins = [];

if ( isProduction ) {
	plugins.push(new UglifyJSPlugin({
		compress:true ,
		comments:false
	}));
}

const createWebpackConfig = libraryTarget => ({
	entry:'./src/create-redux-duckling.js' ,
	output:{
		path:path.resolve('./dist') ,
		filename:'redux-ducklings' + (libraryTarget === 'commonjs' ? '.cjs' : '') + (isProduction ? '.min' : '') + '.js' ,
		libraryTarget:libraryTarget ,
		library:'createReduxDuckling'
	} ,
	module:{
		rules:[
			{
				test:/\.(js)$/ ,
				loader:'babel-loader' ,
				exclude:/node_modules/
			}
		]
	} ,
	plugins
});

module.exports = [
	createWebpackConfig('commonjs') ,
	createWebpackConfig('var')
];