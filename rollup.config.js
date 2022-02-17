import tsc from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'

export default {
  input: 'src/main.ts',
  output: { file: 'docs/app.js', format: 'esm' },
  plugins: [tsc(), resolve()]
}