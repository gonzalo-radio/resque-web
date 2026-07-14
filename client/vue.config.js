module.exports = {
  lintOnSave: false,
  outputDir: '../lib/Resque/Web/public',
  devServer: {
    proxy: {
      "/": {
        target: "http://localhost:8888",
        logLevel: "debug"
      }
    }
  }
};

