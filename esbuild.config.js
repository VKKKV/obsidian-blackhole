const esbuild = require('esbuild');
const builtins = require('builtin-modules');
const path = require('node:path');

const mode = process.argv[2];
const prod = mode === 'production';
const outArg = process.argv.find(arg => arg.startsWith('--outdir='));
const outdir = outArg ? path.resolve(outArg.slice('--outdir='.length)) : '.';

async function main() {
  if (mode === 'harness') {
    const ctx = await esbuild.context({
      entryPoints: ['dev/harness.ts'], bundle: true, format: 'iife',
      target: 'es2020', platform: 'browser', sourcemap: 'inline',
      outfile: 'dev/harness.js', logLevel: 'info',
    });
    await ctx.watch();
    const { port } = await ctx.serve({ servedir: 'dev', host: '127.0.0.1', port: 8000 });
    console.log(`Shader harness: http://127.0.0.1:${port}/`);
    return;
  }
  const options = {
    entryPoints: ['src/main.ts'], bundle: true,
    external: ['obsidian', 'electron', ...builtins],
    format: 'cjs', target: 'es2020', platform: 'browser',
    sourcemap: prod ? false : 'inline', treeShaking: true,
    outfile: path.join(outdir, 'main.js'), logLevel: 'info',
  };
  if (prod) {
    await esbuild.build(options);
    console.log(`Build complete: ${options.outfile}`);
  } else {
    const ctx = await esbuild.context(options);
    await ctx.watch();
    console.log('Watching for changes...');
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
