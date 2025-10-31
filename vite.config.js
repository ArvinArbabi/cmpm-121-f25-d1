// https://vitejs.dev/config/
export default {
  base: Deno.env.get("cmpm-121-f25-d1") || "/project",
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
