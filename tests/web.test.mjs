import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { allScenes } from '../data/scenes/index.js';

const html = readFileSync(new URL('../docs/index.html', import.meta.url), 'utf8');

test('网页产物存在且是单文件（无外部脚本/样式依赖）', () => {
  assert.ok(html.length > 20000, '页面过小，可能没内联成功');
  assert.ok(html.includes('<style>'));
  assert.ok(!/<script[^>]+src=/.test(html), '不应引用外部脚本');
  assert.ok(!/<link[^>]+stylesheet/.test(html), '不应引用外部样式');
  assert.ok(!html.includes('/*__'), '不应残留构建占位符');
});

test('网页内联了全部 20 个场景数据', () => {
  for (const scene of allScenes) {
    assert.ok(html.includes(`"id":"${scene.id}"`), `页面缺少场景 ${scene.id}`);
    assert.ok(html.includes(scene.title), `页面缺少标题 ${scene.title}`);
  }
});

test('网页内联了核心渲染逻辑（不是复制一份实现）', () => {
  assert.ok(html.includes('function renderPrompt('), '应包含 core.js 的 renderPrompt');
  assert.ok(html.includes('function listScenes('), '应包含 core.js 的 listScenes');
  assert.ok(!html.includes('export function'), '浏览器侧不应残留 export 关键字');
});

test('页面包含工作台三块结构', () => {
  for (const id of ['picker', 'workbench', 'messages', 'slots', 'result-prompt', 'copy']) {
    assert.ok(html.includes(`id="${id}"`), `缺少元素 #${id}`);
  }
  assert.ok(html.includes('需求定义卡'), '缺少定义卡标题');
});
