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

module.exports = {
	entry:'./index.js' ,
	output:{
		path:path.resolve('./dist') ,
		filename:'redux-ducklings' + (isProduction ? '.min' : '') + '.js' ,
		libraryTarget:'var' ,
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
};