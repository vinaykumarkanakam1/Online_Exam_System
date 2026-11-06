import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: "index.html",
        admin: "admin.html",
        student: "student.html",
        result: "result.html",
      },
    },
  },
});