import test from 'node:test';
import assert from 'node:assert/strict';

import { allScenes } from '../data/scenes/index.js';
import { SKILL_DIR, SKILL_NAME, buildSkillFiles } from '../src/skill-builder.js';

const files = buildSkillFiles(allScenes);
const byPath = new Map(files.map((file) => [file.path, file.content]));

test('Skill 文件数量正确（索引 + 来源 + 每个场景一个）', () => {
  assert.equal(files.length, 3 + allScenes.length);
  for (const file of files) {
    assert.ok(file.path.startsWith(`${SKILL_DIR}/`), `路径应在 Skill 目录下：${file.path}`);
    assert.ok(file.content.length > 0, `${file.path} 内容为空`);
  }
});

test('SKILL.md 有合法 frontmatter', () => {
  const skill = byPath.get(`${SKILL_DIR}/SKILL.md`);
  assert.ok(skill, '缺少 SKILL.md');
  assert.match(skill, /^---\n/, 'frontmatter 必须以 --- 开头');
  assert.ok(skill.includes(`name: ${SKILL_NAME}`));
  assert.match(skill, /\ndescription: .{50,}/, 'description 至少 50 字符');
  const nameLine = skill.split('\n').find((line) => line.startsWith('name: '));
  assert.ok(/^name: [a-z0-9-]+$/.test(nameLine), 'name 只能小写字母/数字/连字符');
});

test('SKILL.md 声明了 MCP 优先与本地兜底流程', () => {
  const skill = byPath.get(`${SKILL_DIR}/SKILL.md`);
  assert.ok(skill.includes('prompt-workbench'), '应提到 MCP 服务器名');
  assert.ok(skill.includes('recommend_scene'));
  assert.ok(skill.includes('get_questionnaire'));
  assert.ok(skill.includes('render_prompt'));
  assert.ok(skill.includes('references/scenes-index.md'));
  assert.ok(skill.includes('一次只问一个问题'));
});

test('SKILL.md 列出全部场景 id', () => {
  const skill = byPath.get(`${SKILL_DIR}/SKILL.md`);
  for (const scene of allScenes) {
    assert.ok(skill.includes(`\`${scene.id}\``), `SKILL.md 缺少场景 ${scene.id}`);
  }
});

test('场景索引覆盖全部场景与分类统计', () => {
  const index = byPath.get(`${SKILL_DIR}/references/scenes-index.md`);
  assert.ok(index);
  for (const scene of allScenes) {
    assert.ok(index.includes(`\`${scene.id}\``), `索引缺少 ${scene.id}`);
    assert.ok(index.includes(scene.title));
  }
  for (const scene of allScenes) {
    assert.ok(index.includes(`- ${scene.category}：`), `缺少分类统计：${scene.category}`);
  }
});

test('每个场景文件包含问题清单、模板与来源', () => {
  for (const scene of allScenes) {
    const content = byPath.get(`${SKILL_DIR}/references/scenes/${scene.id}.md`);
    assert.ok(content, `缺少场景文件：${scene.id}`);
    assert.ok(content.includes(scene.title));
    assert.ok(content.includes(scene.whenToUse));
    for (const question of scene.questions) {
      assert.ok(content.includes(`\`${question.key}\``), `${scene.id} 缺少问题 ${question.key}`);
      assert.ok(content.includes(question.ask), `${scene.id} 缺少提问文案 ${question.key}`);
    }
    assert.ok(content.includes(scene.template), `${scene.id} 缺少模板原文`);
    for (const source of scene.sources) {
      assert.ok(content.includes(source.repo), `${scene.id} 缺少来源 ${source.repo}`);
    }
  }
});

test('来源汇总覆盖所有场景的所有来源', () => {
  const sources = byPath.get(`${SKILL_DIR}/references/sources.md`);
  assert.ok(sources);
  const expected = allScenes.reduce((sum, scene) => sum + scene.sources.length, 0);
  const rows = sources.split('\n').filter((line) => line.startsWith('| ') && line.includes('|')).length - 2;
  assert.equal(rows, expected, '来源表行数应与场景数据一致');
  for (const scene of allScenes) {
    for (const source of scene.sources) {
      assert.ok(sources.includes(source.repo), `来源表缺少 ${source.repo}`);
    }
  }
});

test('生成是纯函数：连续两次结果完全一致', () => {
  const again = buildSkillFiles(allScenes);
  assert.equal(again.length, files.length);
  for (let i = 0; i < files.length; i += 1) {
    assert.equal(again[i].path, files[i].path);
    assert.equal(again[i].content, files[i].content);
  }
});
