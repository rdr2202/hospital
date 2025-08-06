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
    // You can specify a different port here
  },
  css: {
    postcss: {
      plugins: [tailwindcss("./tailwind.config.cjs")]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxkYXlhYVxcXFxEZXNrdG9wXFxcXHdlYnNpdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGRheWFhXFxcXERlc2t0b3BcXFxcd2Vic2l0ZVxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvZGF5YWEvRGVza3RvcC93ZWJzaXRlL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICd0YWlsd2luZGNzcyc7XHJcbmltcG9ydCBmcyBmcm9tICdmcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6ICcwLjAuMC4wJyxcclxuICAgIHBvcnQ6IDUxNzMsXHJcbiAgICBodHRwczp7XHJcbiAgICAgIGtleTogZnMucmVhZEZpbGVTeW5jKCdzZXJ2ZXIua2V5JyksXHJcbiAgICAgIGNlcnQ6IGZzLnJlYWRGaWxlU3luYygnc2VydmVyLmNydCcpIH0gIC8vIFlvdSBjYW4gc3BlY2lmeSBhIGRpZmZlcmVudCBwb3J0IGhlcmVcclxuICB9LFxyXG5cclxuICBjc3M6IHtcclxuICAgIHBvc3Rjc3M6IHtcclxuICAgICAgcGx1Z2luczogW3RhaWx3aW5kY3NzKCcuL3RhaWx3aW5kLmNvbmZpZy5janMnKV1cclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXNSLFNBQVMsb0JBQW9CO0FBQ25ULE9BQU8sV0FBVztBQUNsQixPQUFPLGlCQUFpQjtBQUN4QixPQUFPLFFBQVE7QUFFZixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTTtBQUFBLE1BQ0osS0FBSyxHQUFHLGFBQWEsWUFBWTtBQUFBLE1BQ2pDLE1BQU0sR0FBRyxhQUFhLFlBQVk7QUFBQSxJQUFFO0FBQUE7QUFBQSxFQUN4QztBQUFBLEVBRUEsS0FBSztBQUFBLElBQ0gsU0FBUztBQUFBLE1BQ1AsU0FBUyxDQUFDLFlBQVksdUJBQXVCLENBQUM7QUFBQSxJQUNoRDtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
