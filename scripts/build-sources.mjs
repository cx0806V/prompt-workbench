import { writeFileSync } from 'node:fs';
import { allScenes } from '../data/scenes/index.js';

const lines = [
  '# 来源与致谢',
  '',
  '> 本文件由 `npm run build:sources` 从 `data/scenes/*.js` 的 `sources` 字段自动生成，**不要手改**。',
  '> 规则：只要借鉴了别人的做法，就必须写清「借鉴了什么 + 我怎么改的」。没有来源的想法，不写进来。',
  '',
  '| 场景 | 借鉴项目 | 借鉴了什么 | 我改了什么 |',
  '| --- | --- | --- | --- |',
];

for (const scene of allScenes) {
  for (const source of scene.sources) {
    lines.push(`| ${scene.title} | ${source.repo} | ${source.what} | ${source.how} |`);
  }
}

lines.push('');
lines.push('## 说明');
lines.push('');
lines.push('- 「借鉴」指思路、结构、追问方式，不是复制代码；各项目原始代码仍归原作者，许可证以各自仓库为准。');
lines.push('- 本项目自己的部分：场景切分、中文提问文案、模板结构、渲染与校验逻辑、MCP 服务实现。');

writeFileSync(new URL('../SOURCES.md', import.meta.url), lines.join('\n') + '\n', 'utf8');
console.log(`SOURCES.md 已生成：${allScenes.length} 个场景，${lines.length} 行`);
