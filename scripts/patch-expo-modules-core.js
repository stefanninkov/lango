/**
 * Patch expo-modules-core's registerWebModule to accept an optional
 * module-name string as a second argument.
 *
 * expo-font 55.x passes (factory, 'ExpoFontLoader') but
 * expo-modules-core 2.2.x only accepts a single class argument and
 * derives the name from Function.prototype.name — which is empty
 * after minification, crashing the web bundle.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-modules-core',
  'src',
  'registerWebModule.ts'
);

const original = fs.readFileSync(filePath, 'utf8');

// Only patch if it hasn't been patched yet
if (original.includes('moduleName?: string')) {
  console.log('registerWebModule already patched, skipping.');
  process.exit(0);
}

const patched = original
  .replace(
    /\(moduleImplementation: ModuleType\): ModuleType \{/,
    '(moduleImplementation: ModuleType, moduleName?: string): ModuleType {'
  )
  .replace(
    'const moduleName = moduleImplementation.name;',
    'const _moduleName = moduleName || moduleImplementation.name;'
  )
  .replace(
    /if \(!moduleName\) \{/,
    'if (!_moduleName) {'
  )
  .replace(
    /if \(globalThis\.expo\.modules\[moduleName\]\) \{/,
    'if (globalThis.expo.modules[_moduleName]) {'
  )
  .replace(
    /return globalThis\.expo\.modules\[moduleName\];[\s\S]*?globalThis\.expo\.modules\[moduleName\] = new moduleImplementation\(\);[\s\S]*?return globalThis\.expo\.modules\[moduleName\];/,
    `return globalThis.expo.modules[_moduleName];\n  }\n  globalThis.expo.modules[_moduleName] = typeof moduleImplementation === 'function' && !moduleImplementation.prototype ? moduleImplementation() : new moduleImplementation();\n  return globalThis.expo.modules[_moduleName];`
  );

fs.writeFileSync(filePath, patched, 'utf8');
console.log('Patched registerWebModule to support optional name argument.');
