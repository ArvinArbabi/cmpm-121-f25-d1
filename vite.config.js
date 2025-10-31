// vite.config.js
export default {
  // must match https://arvinarbabi.github.io/**cmpm-121-f25-d1**/
  // WHY WONT THIS WORK!!!!!
  base: "/cmpm-121-f25-d1/",
  server: { port: 3000, open: true },
  build: { target: "esnext", outDir: "dist", sourcemap: true },
};
