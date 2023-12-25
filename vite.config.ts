import {defineConfig} from "vite";

/** @type {import('vite').UserConfig} */
const wasmContentTypePlugin = {
    name: "wasm-content-type-plugin",
    configureServer(server) {
        server.middlewares.use((req, res, next) => {
            if (req.url.endsWith(".wasm")) {
                res.setHeader("Content-Type", "application/wasm");
            }
            next();
        });
    },
};
export default defineConfig({
    plugins: [wasmContentTypePlugin],
    define: {},
    optimizeDeps: {
        exclude: ["@rollup/browser"],
        esbuildOptions: {
            define: {
                global: 'window',
            }
        }
    },
    server: {
        port: 3001,
        proxy: {
            '/.netlify': {
                target: 'http://localhost:9999/',
            }
        },
        headers: {}
    },
    base: "/"

})