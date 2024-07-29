import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/argparse.js',
      format: 'umd',
      name: 'argparse',
      sourcemap: true,
    },
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
      sourcemap: true,
    },
  ],
  plugins: [typescript()],
};