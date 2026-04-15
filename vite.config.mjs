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
  // server: {
  //   // this ensures that the browser opens upon server start
  //   open: false, // Don't auto-open browser on server
  //   host: "0.0.0.0",
  //   // this sets a default port to 3000
  //   port: 3000,
  //   // Allow requests from your domain
  //   allowedHosts: [
  //     "diligence2ai.com",
  //     "www.diligence2ai.com",
  //     "localhost",
  //     "127.0.0.1",
  //     ".diligence2ai.com", // This allows all subdomains
  //   ],
  // },
  

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
    proxy: {
      "/api": {
        target: "http://15.206.180.140:4422",
        changeOrigin: true,
      },
    },
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
          // React core
          if (id.includes("/node_modules/react/") || id.includes("/node_modules/react-dom/") || id.includes("/node_modules/scheduler/")) return "react-vendor";

          // Merge emotion+MUI+antd into ONE ui-vendor to kill the circular warnings
          // They're all loaded together anyway — no benefit splitting them
          if (
            id.includes("/node_modules/@emotion/") ||
            id.includes("/node_modules/@mui/") ||
            id.includes("/node_modules/antd/") ||
            id.includes("/node_modules/rc-") ||
            id.includes("/node_modules/@ant-design/") ||
            id.includes("/node_modules/stylis/")
          ) return "ui-vendor";

          // Charts
          if (id.includes("/node_modules/echarts/") || id.includes("/node_modules/zrender/")) return "echarts-vendor";
          if (id.includes("/node_modules/apexcharts/") || id.includes("/node_modules/react-apexcharts/")) return "apex-vendor";

          // Document generation
          if (id.includes("/node_modules/docx/") || id.includes("/node_modules/file-saver/") || id.includes("/node_modules/html2canvas/")) return "docgen-vendor";

          // Animation
          if (id.includes("/node_modules/@react-spring/") || id.includes("/node_modules/react-spring/")) return "spring-vendor";

          if (id.includes("/node_modules/dompurify/")) return "purify-vendor";
          if (id.includes("/node_modules/react-router/") || id.includes("/node_modules/react-router-dom/") || id.includes("/node_modules/@remix-run/")) return "router-vendor";
          if (id.includes("/node_modules/formik/") || id.includes("/node_modules/yup/")) return "forms-vendor";
          if (id.includes("/node_modules/axios/")) return "axios-vendor";
        },
      },
    },
  },
});
