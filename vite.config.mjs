// https://github.com/vitejs/vite/discussions/3448
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import jsconfigPaths from "vite-jsconfig-paths";

// ----------------------------------------------------------------------

export default defineConfig({
  plugins: [react(), jsconfigPaths()],
  // https://github.com/jpuri/react-draft-wysiwyg/issues/1317
  base: "/", // accessing env variable is not possible here. So hard coding this.
  define: {
    global: "window",
  },
  resolve: {
    dedupe: [
      "react",
      "react-dom",
      "@emotion/react",
      "@emotion/styled",
      "@emotion/cache",
    ],
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), "node_modules/$1"),
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), "src/$1"),
      },
      {
        find: "@emotion/styled",
        replacement: path.resolve("./node_modules/@emotion/styled"),
      },
      {
        find: "@emotion/react",
        replacement: path.resolve("./node_modules/@emotion/react"),
      },
    ],
  },
  // Optimize for production and memory usage
  esbuild: {
    // Reduce memory usage
    target: "es2015",
    logLevel: "error",
  },
  optimizeDeps: {
    force: false,
    include: [
      "react",
      "react-dom",
      "@emotion/react",
      "@emotion/styled",
      "@emotion/cache",
    ],
  },
  server: {
    // this ensures that the browser opens upon server start
    open: false, // Don't auto-open browser on server
    host: "0.0.0.0",
    // this sets a default port to 3000
    port: 3000,
    // Allow requests from your domain
    allowedHosts: [
      "diligence2ai.com",
      "www.diligence2ai.com",
      "localhost",
      "127.0.0.1",
      ".diligence2ai.com", // This allows all subdomains
    ],
  },
  preview: {
    // this ensures that the browser opens upon preview start
    open: false, // Don't auto-open browser
    // this sets a default port to 3000
    port: 3000,
    host: "0.0.0.0",
    // Allow requests from your domain in preview mode too
    allowedHosts: [
      "diligence2ai.com",
      "www.diligence2ai.com",
      "localhost",
      "127.0.0.1",
      ".diligence2ai.com", // This allows all subdomains
    ],
  },
  build: {
    // Optimize build for smaller memory usage
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
        // Force all emotion into one chunk
          if (id.includes('@emotion/styled')) return 'ui-vendor';
          if (id.includes('@emotion/react')) return 'ui-vendor';
          if (id.includes('@emotion/cache')) return 'ui-vendor';
          if (id.includes('@mui/material')) return 'ui-vendor';
          if (id.includes('react-dom') || id.includes('react/')) return 'react-vendor';
          if (id.includes('antd')) return 'antd-vendor';
        },
      },
    },
  },
});
