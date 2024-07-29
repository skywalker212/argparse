import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/argparse.min.js',
      format: 'umd',
      name: 'argparse',
      plugins: [terser()],
      sourcemap: true,
    },
    {
      file: 'dist/argparse.esm.js',
      format: 'es',
      plugins: [terser()],
      sourcemap: true,
    },
  ],
  plugins: [
    typescript(),
    nodeResolve({ browser: true }),
  ],
};