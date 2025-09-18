import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path cho mọi route
  base: "/",

  // Cấu hình server dev
  server: {
    port: 5173, // Cổng mặc định
    host: "localhost", // Hostname
    strictPort: true,
    open: true, // Tự động mở trình duyệt
    // Bắt buộc cho React Router
    historyApiFallback: {
      rewrites: [
        { from: /./, to: "/index.html" }, // Fallback mọi route
      ],
    },
  },

  // Tối ưu preload (optional)
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
});