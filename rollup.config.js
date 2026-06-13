import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import url from '@rollup/plugin-url';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/starlink-card.ts',
  output: {
    file: 'starlink-card.js',
    format: 'es',
    inlineDynamicImports: true,
    sourcemap: false,
  },
  plugins: [
    // inline PNG as a base64 data URI (limit high enough to never emit a file)
    url({ include: ['**/*.png'], limit: 10 * 1024 * 1024, emitFiles: false }),
    resolve(),
    commonjs(),
    json(),
    typescript({ tsconfig: './tsconfig.json' }),
    terser({ format: { comments: false } }),
  ],
};
