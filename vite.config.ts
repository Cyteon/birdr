import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
// import webSocketServer from './src/ws'; ⚠️ BROKEN

export default defineConfig({
  plugins: [sveltekit() /* webSocketServer ⚠️ Broken */],
});
