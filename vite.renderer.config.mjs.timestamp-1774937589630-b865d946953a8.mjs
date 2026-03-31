// vite.renderer.config.mjs
import { defineConfig } from "file:///C:/Users/aafba/Desktop/Island/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/aafba/Desktop/Island/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_renderer_config_default = defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.mp3"],
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        settings: "./settings.html"
      },
      output: {
        assetFileNames: "assets/[name].[ext]"
      }
    }
  },
  resolve: {
    alias: {
      "@": "/src"
    }
  }
});
export {
  vite_renderer_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5yZW5kZXJlci5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcYWFmYmFcXFxcRGVza3RvcFxcXFxJc2xhbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGFhZmJhXFxcXERlc2t0b3BcXFxcSXNsYW5kXFxcXHZpdGUucmVuZGVyZXIuY29uZmlnLm1qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvYWFmYmEvRGVza3RvcC9Jc2xhbmQvdml0ZS5yZW5kZXJlci5jb25maWcubWpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWdcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gICAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gICAgICBhc3NldHNJbmNsdWRlOiBbJyoqLyoubXAzJ10sXG4gICAgICBidWlsZDoge1xuICAgICAgICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgaW5wdXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1haW46ICcuL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6ICcuL3NldHRpbmdzLmh0bWwnXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldEZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0uW2V4dF0nXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICB9LFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgYWxpYXM6IHtcbiAgICAgICAgICAgICAgICAgIFwiQFwiOiBcIi9zcmNcIixcbiAgICAgICAgICAgIH0sXG4gICAgICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVTLFNBQVMsb0JBQW9CO0FBQ3BVLE9BQU8sV0FBVztBQUdsQixJQUFPLCtCQUFRLGFBQWE7QUFBQSxFQUN0QixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsZUFBZSxDQUFDLFVBQVU7QUFBQSxFQUMxQixPQUFPO0FBQUEsSUFDRCxlQUFlO0FBQUEsTUFDVCxPQUFPO0FBQUEsUUFDRCxNQUFNO0FBQUEsUUFDTixVQUFVO0FBQUEsTUFDaEI7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNGLGdCQUFnQjtBQUFBLE1BQ3RCO0FBQUEsSUFDTjtBQUFBLEVBQ047QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNILE9BQU87QUFBQSxNQUNELEtBQUs7QUFBQSxJQUNYO0FBQUEsRUFDTjtBQUNOLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
