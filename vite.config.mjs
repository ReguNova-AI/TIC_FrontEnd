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
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), "node_modules/$1"),
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), "src/$1"),
      },
    ],
  },
  server: {
    // this ensures that the browser opens upon server start
    open: true,
    host: "0.0.0.0",
    // this sets a default port to 3000
    port: 3000,
    // Allow requests from your domain
    allowedHosts: [
      "diligence2ai.com",
      "www.diligence2ai.com",
      "localhost",
      "127.0.0.1",
      ".diligence2ai.com" // This allows all subdomains
    ],
  },
  preview: {
    // this ensures that the browser opens upon preview start
    open: true,
    // this sets a default port to 3000
    port: 3000,
    host: "0.0.0.0",
    // Allow requests from your domain in preview mode too
    allowedHosts: [
      "diligence2ai.com",
      "www.diligence2ai.com",
      "localhost",
      "127.0.0.1",
      ".diligence2ai.com" // This allows all subdomains
    ],
  },
});
