// vite.config.js
import { defineConfig } from "file:///C:/Users/dayaa/Desktop/website/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/dayaa/Desktop/website/node_modules/@vitejs/plugin-react/dist/index.mjs";
import tailwindcss from "file:///C:/Users/dayaa/Desktop/website/node_modules/tailwindcss/lib/index.js";
import fs from "fs";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    https: {
      key: fs.readFileSync("server.key"),
      cert: fs.readFileSync("server.crt")
    }
  },
  css: {
    postcss: {
      plugins: [tailwindcss("./tailwind.config.cjs")]
    }
  },
  build: {
    sourcemap: false,
    // 👈 This disables exposing source maps in production
    minify: "esbuild",
    // Optional: 'terser' is slower but can be more aggressive
    outDir: "dist",
    // Default output directory, can be customized
    target: "esnext"
    // Good for modern browsers
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxkYXlhYVxcXFxEZXNrdG9wXFxcXHdlYnNpdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGRheWFhXFxcXERlc2t0b3BcXFxcd2Vic2l0ZVxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvZGF5YWEvRGVza3RvcC93ZWJzaXRlL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICd0YWlsd2luZGNzcyc7XHJcbmltcG9ydCBmcyBmcm9tICdmcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6ICcwLjAuMC4wJyxcclxuICAgIHBvcnQ6IDUxNzMsXHJcbiAgICBodHRwczoge1xyXG4gICAgICBrZXk6IGZzLnJlYWRGaWxlU3luYygnc2VydmVyLmtleScpLFxyXG4gICAgICBjZXJ0OiBmcy5yZWFkRmlsZVN5bmMoJ3NlcnZlci5jcnQnKVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgY3NzOiB7XHJcbiAgICBwb3N0Y3NzOiB7XHJcbiAgICAgIHBsdWdpbnM6IFt0YWlsd2luZGNzcygnLi90YWlsd2luZC5jb25maWcuY2pzJyldXHJcbiAgICB9XHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgc291cmNlbWFwOiBmYWxzZSwgLy8gXHVEODNEXHVEQzQ4IFRoaXMgZGlzYWJsZXMgZXhwb3Npbmcgc291cmNlIG1hcHMgaW4gcHJvZHVjdGlvblxyXG4gICAgbWluaWZ5OiAnZXNidWlsZCcsIC8vIE9wdGlvbmFsOiAndGVyc2VyJyBpcyBzbG93ZXIgYnV0IGNhbiBiZSBtb3JlIGFnZ3Jlc3NpdmVcclxuICAgIG91dERpcjogJ2Rpc3QnLCAgICAvLyBEZWZhdWx0IG91dHB1dCBkaXJlY3RvcnksIGNhbiBiZSBjdXN0b21pemVkXHJcbiAgICB0YXJnZXQ6ICdlc25leHQnICAgLy8gR29vZCBmb3IgbW9kZXJuIGJyb3dzZXJzXHJcbiAgfVxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzUixTQUFTLG9CQUFvQjtBQUNuVCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxRQUFRO0FBRWYsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLEtBQUssR0FBRyxhQUFhLFlBQVk7QUFBQSxNQUNqQyxNQUFNLEdBQUcsYUFBYSxZQUFZO0FBQUEsSUFDcEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSCxTQUFTO0FBQUEsTUFDUCxTQUFTLENBQUMsWUFBWSx1QkFBdUIsQ0FBQztBQUFBLElBQ2hEO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsV0FBVztBQUFBO0FBQUEsSUFDWCxRQUFRO0FBQUE7QUFBQSxJQUNSLFFBQVE7QUFBQTtBQUFBLElBQ1IsUUFBUTtBQUFBO0FBQUEsRUFDVjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
