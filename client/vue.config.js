// Backend API target for the dev server proxy. Defaults to a local backend on
// :8888; inside the compose `dev` service it's set to http://web:8888.
const API_PROXY = process.env.API_PROXY || "http://localhost:8888";

module.exports = {
  lintOnSave: false,
  outputDir: '../lib/Resque/Web/public',
  devServer: {
    // Bind all interfaces and accept any Host header so the server is reachable
    // when running inside a container (accessed via the mapped port).
    host: "0.0.0.0",
    allowedHosts: "all",
    proxy: {
      "/": {
        target: API_PROXY,
        logLevel: "debug"
      }
    }
  }
};

