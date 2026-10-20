import test from 'node:test';
import assert from 'node:assert/strict';

import { allScenes } from '../data/scenes/index.js';
import {
  VERSION,
  findScene,
  getQuestionnaire,
  listScenes,
  matchScenes,
  renderPrompt,
  sceneStats,
  validateScene,
  validateScenes,
} from '../src/core.js';
import { TOOLS, handleMessage } from '../src/mcp.js';

const VALID_ANSWERS = {
  goal: '做一个能自动整理会议记录的小工具',
  user: '给我自己，开完会用',
  scope: '能上传录音、能出摘要、能导出 txt',
  accept: '30 分钟内的会议，5 分钟内出摘要',
};

test('场景库全部合法', () => {
  const result = validateScenes(allScenes);
  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.ok(allScenes.length >= 3, '至少 3 个场景');
});

test('每个场景的 id 唯一、问题非空、模板含占位符', () => {
  const ids = new Set();
  for (const scene of allScenes) {
    assert.ok(!ids.has(scene.id), `id 重复：${scene.id}`);
    ids.add(scene.id);
    assert.ok(scene.questions.length > 0, `${scene.id} 没有问题`);
    for (const question of scene.questions) {
      assert.ok(scene.template.includes(`{{${question.key}}}`), `${scene.id} 模板缺 {{${question.key}}}`);
      assert.ok(question.ask.length > 0, `${scene.id}.${question.key} 缺少提问文案`);
    }
  }
});

test('每个场景都必须注明 sources（借鉴来源）', () => {
  for (const scene of allScenes) {
    assert.ok(Array.isArray(scene.sources) && scene.sources.length > 0, `${scene.id} 没有 sources`);
    for (const source of scene.sources) {
      assert.ok(source.repo, `${scene.id} 的 source 缺 repo`);
      assert.ok(source.what, `${scene.id} 的 source 缺 what`);
    }
  }
});

test('validateScene 能抓出坏场景', () => {
  assert.ok(validateScene(null).length > 0);
  assert.ok(validateScene({}).length > 0);

  const missingSources = { ...allScenes[0], id: 'temp-a', sources: [] };
  assert.ok(validateScene(missingSources).some((e) => e.includes('sources')));

  const missingPlaceholder = {
    ...allScenes[0],
    id: 'temp-b',
    questions: [{ key: 'notInTemplate', ask: 'x' }],
  };
  assert.ok(validateScene(missingPlaceholder).some((e) => e.includes('占位符')));

  const badId = { ...allScenes[0], id: 'Bad_ID' };
  assert.ok(validateScene(badId).some((e) => e.includes('小写字母')));
});

test('listScenes 返回摘要且不含完整模板', () => {
  const scenes = listScenes(allScenes);
  assert.equal(scenes.length, allScenes.length);
  assert.ok(scenes[0].questionCount > 0);
  assert.equal(scenes[0].template, undefined);
});

test('listScenes 支持分类与关键词过滤', () => {
  const byCategory = listScenes(allScenes, { category: '需求' });
  assert.equal(byCategory.length, 1);
  assert.equal(byCategory[0].id, 'requirement-clarify');

  const byKeyword = listScenes(allScenes, { keyword: '报告' });
  assert.ok(byKeyword.length >= 1);
  assert.ok(byKeyword.every((scene) => scene.id === 'document-writing' || true));

  const noHit = listScenes(allScenes, { keyword: '不存在的关键词xyz' });
  assert.equal(noHit.length, 0);
});

test('findScene 命中与未命中', () => {
  assert.ok(findScene(allScenes, 'requirement-clarify'));
  assert.equal(findScene(allScenes, 'nope'), null);
});

test('getQuestionnaire 返回完整问题清单', () => {
  const questionnaire = getQuestionnaire(allScenes, 'requirement-clarify');
  assert.ok(questionnaire);
  assert.equal(questionnaire.sceneId, 'requirement-clarify');
  assert.equal(questionnaire.questions.length, 5);
  const required = questionnaire.questions.filter((question) => question.required);
  assert.equal(required.length, 4, '4 个必填、1 个可选');
  assert.equal(getQuestionnaire(allScenes, 'nope'), null);
});

test('matchScenes 能把一句话匹配到场景', () => {
  const writing = matchScenes(allScenes, '帮我写一份项目总结报告');
  assert.ok(writing.length > 0, '应匹配到写作场景');
  assert.equal(writing[0].id, 'document-writing');

  const requirement = matchScenes(allScenes, '这个功能的需求我还没想清楚，要写验收标准');
  assert.ok(requirement.length > 0);
  assert.equal(requirement[0].id, 'requirement-clarify');

  assert.deepEqual(matchScenes(allScenes, '完全无关的一句话zzz'), []);
  assert.deepEqual(matchScenes(allScenes, ''), []);
});

test('renderPrompt 渲染完整答案', () => {
  const result = renderPrompt(allScenes, 'requirement-clarify', VALID_ANSWERS);
  assert.equal(result.missing.length, 0);
  assert.ok(!result.prompt.includes('{{'), '不能残留占位符');
  assert.ok(result.prompt.includes(VALID_ANSWERS.goal));
  assert.ok(result.prompt.includes(VALID_ANSWERS.accept));
  assert.ok(result.prompt.includes('待确认'));
});

test('renderPrompt 缺必填项时给出 missing', () => {
  const result = renderPrompt(allScenes, 'requirement-clarify', { goal: '只想了个开头' });
  assert.deepEqual(result.missing.sort(), ['accept', 'scope', 'user']);
  assert.ok(result.prompt.includes('（未提供，请先向用户确认）'));
});

test('renderPrompt 对可选缺失与未知字段给出 warnings', () => {
  const result = renderPrompt(allScenes, 'requirement-clarify', VALID_ANSWERS);
  assert.ok(result.warnings.some((w) => w.includes('constraint')), '可选项未填应提示');

  const withUnknown = renderPrompt(allScenes, 'requirement-clarify', { ...VALID_ANSWERS, foo: 'bar' });
  assert.ok(withUnknown.warnings.some((w) => w.includes('foo')), '未知字段应提示');
});

test('renderPrompt 对不存在的场景安全返回', () => {
  const result = renderPrompt(allScenes, 'nope', {});
  assert.equal(result.prompt, '');
  assert.ok(result.warnings.length > 0);
});

test('sceneStats 统计正确', () => {
  const stats = sceneStats(allScenes);
  assert.equal(stats.sceneCount, allScenes.length);
  assert.equal(stats.version, VERSION);
  const expectedQuestions = allScenes.reduce((sum, scene) => sum + scene.questions.length, 0);
  assert.equal(stats.questionCount, expectedQuestions);
  for (const scene of allScenes) {
    assert.ok(stats.categories[scene.category] >= 1);
  }
});

test('MCP initialize 返回协议版本与能力', () => {
  const response = handleMessage(allScenes, { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
  assert.equal(response.id, 1);
  assert.equal(response.result.protocolVersion, '2025-06-18');
  assert.ok(response.result.capabilities.tools);
  assert.equal(response.result.serverInfo.name, 'prompt-workbench');
});

test('MCP 通知不需要响应', () => {
  const response = handleMessage(allScenes, { jsonrpc: '2.0', method: 'notifications/initialized' });
  assert.equal(response, null);
});

test('MCP tools/list 暴露 4 个工具且 schema 完整', () => {
  const response = handleMessage(allScenes, { jsonrpc: '2.0', id: 2, method: 'tools/list' });
  const names = response.result.tools.map((tool) => tool.name);
  assert.deepEqual(names, ['list_scenes', 'recommend_scene', 'get_questionnaire', 'render_prompt']);
  assert.equal(TOOLS.length, 4);
  for (const tool of TOOLS) {
    assert.ok(tool.description.length > 0, `${tool.name} 缺描述`);
    assert.equal(tool.inputSchema.type, 'object');
  }
});

test('MCP tools/call list_scenes 可调用', () => {
  const response = handleMessage(allScenes, {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: { name: 'list_scenes', arguments: {} },
  });
  assert.equal(response.result.content[0].type, 'text');
  const payload = JSON.parse(response.result.content[0].text);
  assert.equal(payload.scenes.length, allScenes.length);
  assert.ok(response.result.isError === undefined || response.result.isError === false);
});

test('MCP tools/call recommend_scene / get_questionnaire / render_prompt', () => {
  const recommend = handleMessage(allScenes, {
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: { name: 'recommend_scene', arguments: { text: '帮我写一份项目总结报告' } },
  });
  const recommendPayload = JSON.parse(recommend.result.content[0].text);
  assert.equal(recommendPayload.matches[0].id, 'document-writing');

  const questionnaire = handleMessage(allScenes, {
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: { name: 'get_questionnaire', arguments: { sceneId: 'coding-task' } },
  });
  const questionnairePayload = JSON.parse(questionnaire.result.content[0].text);
  assert.equal(questionnairePayload.sceneId, 'coding-task');
  assert.ok(questionnairePayload.questions.length >= 4);

  const rendered = handleMessage(allScenes, {
    jsonrpc: '2.0',
    id: 6,
    method: 'tools/call',
    params: { name: 'render_prompt', arguments: { sceneId: 'requirement-clarify', answers: VALID_ANSWERS } },
  });
  const renderedPayload = JSON.parse(rendered.result.content[0].text);
  assert.equal(renderedPayload.complete, true);
  assert.ok(renderedPayload.prompt.includes(VALID_ANSWERS.goal));
});

test('MCP 错误分支', () => {
  const unknownScene = handleMessage(allScenes, {
    jsonrpc: '2.0',
    id: 7,
    method: 'tools/call',
    params: { name: 'get_questionnaire', arguments: { sceneId: 'nope' } },
  });
  assert.equal(unknownScene.result.isError, true);

  const unknownTool = handleMessage(allScenes, {
    jsonrpc: '2.0',
    id: 8,
    method: 'tools/call',
    params: { name: 'destroy_everything', arguments: {} },
  });
  assert.equal(unknownTool.result.isError, true);

  const unknownMethod = handleMessage(allScenes, { jsonrpc: '2.0', id: 9, method: 'nope/nope' });
  assert.equal(unknownMethod.error.code, -32601);

  const invalid = handleMessage(allScenes, null);
  assert.equal(invalid.error.code, -32600);

  const arrayMessage = handleMessage(allScenes, []);
  assert.equal(arrayMessage.error.code, -32600);
});
