module.exports = {
	baseUrl: "/",
	lintOnSave: false,
	runtimeCompiler: true,
	productionSourceMap: false,
	chainWebpack: config => {
    config.plugins.delete("prefetch"); 
    config.output.chunkFilename(`js/[id].[chunkhash:8].js`)
	}
};
