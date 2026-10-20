/**
 * 从场景数据生成 Skill 包：skills/prompt-workbench/
 *
 *   node scripts/build-skills.mjs
 *
 * 产物提交进仓库，CI 会校验「场景数据 → Skill」没有漂移。
 */

import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';

import { allScenes } from '../data/scenes/index.js';
import { SKILL_DIR, buildSkillFiles } from '../src/skill-builder.js';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));

rmSync(path.join(ROOT, SKILL_DIR), { recursive: true, force: true });

const files = buildSkillFiles(allScenes);
let total = 0;
for (const file of files) {
  const target = path.join(ROOT, file.path);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, file.content, 'utf8');
  total += file.content.length;
}

console.log(`Skill 已生成：${SKILL_DIR}/（${files.length} 个文件，${(total / 1024).toFixed(1)} KB）`);
console.log(`  SKILL.md + references/scenes-index.md + references/sources.md + ${allScenes.length} 个场景文件`);
