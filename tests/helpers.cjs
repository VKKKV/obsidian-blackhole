const vm = require('node:vm');
const esbuild = require('esbuild');

function loadTS(entry, mocks = {}, globals = {}) {
  const result = esbuild.buildSync({entryPoints:[entry], bundle:true, platform:'node',
    format:'cjs', write:false, external:Object.keys(mocks), logLevel:'silent'});
  const mod = {exports:{}};
  const sandbox = {module:mod, exports:mod.exports, require:id => id in mocks ? mocks[id] : require(id),
    console, performance, setTimeout, clearTimeout, Uint8Array, Float32Array, ...globals};
  vm.runInNewContext(result.outputFiles[0].text, sandbox, {filename:entry});
  return mod.exports;
}
module.exports = { loadTS };
