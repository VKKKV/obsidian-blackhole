const esbuild = require('esbuild');
const builtins = require('builtin-modules');
const fs = require('fs');

const mode = process.argv[2]; // 'production' | 'harness' | undefined (dev watch)
const prod = mode === 'production';

async function main() {
  // Standalone shader harness — bundles renderer + shader (no Obsidian deps),
  // watches for changes, and serves dev/ on localhost for fast visual iteration.
  if (mode === 'harness') {
    const ctx = await esbuild.context({
      entryPoints: ['dev/harness.ts'],
      bundle: true,
      format: 'iife',
      target: 'es2020',
      platform: 'browser',
      sourcemap: 'inline',
      outfile: 'dev/harness.js',
      logLevel: 'info',
    });
    await ctx.watch();
    const { port } = await ctx.serve({ servedir: 'dev', port: 8000 });
    console.log(`Shader harness: http://localhost:${port}/`);
    return;
  }

  const ctx = await esbuild.context({
    entryPoints: ['src/main.ts'],
    bundle: true,
    external: [
      'obsidian',
      'electron',
      ...builtins,
    ],
    format: 'cjs',
    target: 'es2020',
    platform: 'browser',
    sourcemap: prod ? false : 'inline',
    treeShaking: true,
    outfile: 'main.js',
    logLevel: 'info',
  });

  if (prod) {
    await ctx.rebuild();
    console.log('Build complete: main.js');
    process.exit(0);
  } else {
    await ctx.watch();
    console.log('Watching for changes...');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
