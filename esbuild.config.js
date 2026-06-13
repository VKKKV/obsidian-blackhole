const esbuild = require('esbuild');
const builtins = require('builtin-modules');
const fs = require('fs');

const prod = process.argv[2] === 'production';

async function main() {
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
