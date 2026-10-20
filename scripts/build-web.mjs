/**
 * 生成静态网页工作台：docs/index.html（单文件，零依赖，可直接双击打开或 GitHub Pages 托管）。
 *
 *   node scripts/build-web.mjs
 *
 * 数据与逻辑全部内联：core.js（去掉 export 关键字）+ 场景 JSON + app.js + style.css。
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { allScenes } from '../data/scenes/index.js';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));

const read = (relative) => readFileSync(path.join(ROOT, relative), 'utf8');
const guard = (code) => code.replace(/<\/script/gi, '<\\/script');

const html = read('web-src/index.html');
const css = read('web-src/style.css');
const app = read('web-src/app.js');
const core = read('src/core.js').replace(/^export\s+/gm, '');

const scenesJson = JSON.stringify(allScenes);

let output = html;
output = output.replace('/*__CSS__*/', () => css);
output = output.replace('/*__CORE__*/', () => guard(core));
output = output.replace('/*__SCENES__*/', () => guard(scenesJson));
output = output.replace('/*__APP__*/', () => guard(app));

if (output.includes('/*__')) {
  console.error('有占位符没被替换，检查 web-src/index.html');
  process.exit(1);
}

mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
writeFileSync(path.join(ROOT, 'docs/index.html'), output, 'utf8');

console.log(`docs/index.html 生成完成：${(output.length / 1024).toFixed(1)} KB，${allScenes.length} 个场景`);
