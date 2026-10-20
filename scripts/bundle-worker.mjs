/**
 * 把多文件 ES Module 打成单文件 Worker，用于通过 Cloudflare REST API 直接上传。
 * 不引入任何依赖；只支持本项目用到的 import/export 形式。
 *
 *   node scripts/bundle-worker.mjs   → dist/worker.js
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const ENTRY = 'src/worker.js';

const MODULES = [
  'data/scenes/requirement.js',
  'data/scenes/coding-task.js',
  'data/scenes/document-writing.js',
  'data/scenes/debug.js',
  'data/scenes/code-review.js',
  'data/scenes/refactor-plan.js',
  'data/scenes/test-design.js',
  'data/scenes/api-integration.js',
  'data/scenes/code-explain.js',
  'data/scenes/bug-report.js',
  'data/scenes/perf-opt.js',
  'data/scenes/security-check.js',
  'data/scenes/deploy-ci.js',
  'data/scenes/tech-select.js',
  'data/scenes/data-analysis.js',
  'data/scenes/research-compare.js',
  'data/scenes/learn-tech.js',
  'data/scenes/agent-task.js',
  'data/scenes/tech-doc.js',
  'data/scenes/meta-prompt.js',
  'data/scenes/index.js',
  'src/core.js',
  'src/mcp.js',
  ENTRY,
];

const GEN_SUFFIX = '.__bundle__';

function resolveSpec(importer, spec) {
  const dir = path.posix.dirname(importer);
  const resolved = path.posix.normalize(path.posix.join(dir, spec));
  return resolved.endsWith('.js') ? resolved : `${resolved}.js`;
}

function transform(id, source) {
  let code = source;
  const exportedNames = [];

  // import { a, b } from '...'  |  import X from '...'
  code = code.replace(
    /import\s+(?:\{([^}]*)\}|([A-Za-z0-9_$]+))\s*from\s*['"]([^'"]+)['"];?/g,
    (_match, named, defaultName, spec) => {
      const target = resolveSpec(id, spec);
      if (named) {
        const clean = named
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean)
          .map((part) => part.replace(/\s+as\s+/, ': '))
          .join(', ');
        return `const { ${clean} } = __require('${target}');`;
      }
      return `const ${defaultName} = __require('${target}').default;`;
    },
  );

  // export default ...
  code = code.replace(/export\s+default\s+/g, 'exports.default = ');

  // export const x = ...
  code = code.replace(/export\s+const\s+([A-Za-z0-9_$]+)\s*=/g, (_m, name) => {
    exportedNames.push(name);
    return `const ${name} =`;
  });

  // export function f(...)
  code = code.replace(/export\s+function\s+([A-Za-z0-9_$]+)/g, (_m, name) => {
    exportedNames.push(name);
    return `function ${name}`;
  });

  const tail = exportedNames.map((name) => `exports.${name} = ${name};`).join('\n  ');
  return `__defs['${id}'] = function (exports) {\n${code}\n  ${tail}\n};`;
}

const parts = [];
parts.push('// 由 scripts/bundle-worker.mjs 生成，请勿手改');
parts.push('const __defs = {};');
parts.push('const __cache = {};');
parts.push(`function __require(id) {
  if (__cache[id]) return __cache[id];
  const exports = {};
  __cache[id] = exports;
  const def = __defs[id];
  if (!def) throw new Error('模块不存在: ' + id);
  def(exports);
  return exports;
}`);

for (const id of MODULES) {
  const source = readFileSync(path.join(ROOT, id), 'utf8');
  parts.push(transform(id, source));
}

parts.push(`const __entry = __require('${ENTRY}');`);
parts.push('export default __entry.default;');

const banner = `/* prompt-workbench bundle — ${new Date().toISOString()} */`;
const bundle = `${banner}\n${parts.join('\n\n')}\n`;

mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
writeFileSync(path.join(ROOT, 'dist/worker.js'), bundle, 'utf8');

// 生成上传元数据（Cloudflare Workers API）
const metadata = {
  main_module: 'worker.js',
  compatibility_date: '2026-10-01',
};
writeFileSync(path.join(ROOT, 'dist/metadata.json'), JSON.stringify(metadata, null, 2), 'utf8');

console.log(`dist/worker.js  (${(bundle.length / 1024).toFixed(1)} KB, ${MODULES.length} 个模块)`);
console.log('dist/metadata.json');
