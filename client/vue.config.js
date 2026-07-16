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
    // Serve index.html for unknown routes so a hard reload on a client-side
    // route (e.g. /working) still loads the dev bundle.
    historyApiFallback: true,
    // Proxy ONLY the backend API paths. A catch-all "/" proxy would also grab
    // the HMR websocket (/ws) and forward it to the backend ("Invalid frame
    // header"), breaking live-reload — so we list the API endpoints explicitly
    // and leave everything else (assets, /ws, SPA routes) to the dev server.
    proxy: {
      "/queues": { target: API_PROXY, logLevel: "debug" },
      "/workers": { target: API_PROXY },
      "/stats": { target: API_PROXY },
      "/failed": { target: API_PROXY }
    }
  }
};

