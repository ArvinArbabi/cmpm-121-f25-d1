// vite.config.js
// https://vitejs.dev/config/
export default {
  // Correct base path for your repo
  base: "https://arvinarbabi.github.io/cmpm-121-f25-d1/",

  server: {
    port: 3000,
    open: true,
  },

  build: {
    target: "esnext",
    outDir: "dist",
    sourcemap: true,
  },
};
