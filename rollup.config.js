import typescript from "rollup-plugin-typescript2";
import nodeResolve from "@rollup/plugin-node-resolve";
import path from "path";

module.exports = {
  input: "./src/components/VirtualList/index.tsx",
  external: ["react", "remax", "remax/one"],
  output: [
    // commonjs
    {
      file: "lib/index.js",
      format: "cjs",
      indent: false,
      exports: 'default'
    },
    // esmodules
    {
      file: "lib/index.esm.js",
      format: "es",
      indent: false,
    },
  ],
  plugins: [
    typescript({
      tsconfig: path.resolve("tsconfig.rollup.json"),
      useTsconfigDeclarationDir: true,
    }),
    nodeResolve(),
  ],
};
