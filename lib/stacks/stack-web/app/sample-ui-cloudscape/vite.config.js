import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";


export default defineConfig({
  base: "",
  build: {
    outDir: './build' // specifies the out directory as build to match react-app specs
  },
  plugins: [react()], // specifies the react plugin
  resolve: {
    alias: {
      './runtimeConfig': './runtimeConfig.browser', // <-- addresses child_process missing issue
  },

  build: {
    rollupOptions: {
      external: ['child_process'], // builds child_process externally
    }
  }
}
  });

