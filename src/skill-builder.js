/**
 * 纯函数：把场景数据生成为可安装的 Skill 包（文件列表，不碰文件系统）。
 *
 * 设计要点：
 * - 只此一份数据源：场景来自 data/scenes，Skill 由本文件生成，禁止手写第二份。
 * - 渐进式披露：SKILL.md 只放索引与流程；每个场景一个 references 文件，用到才读。
 * - 与 MCP 壳互补：有 MCP 时优先调工具，没有时走这份离线 Skill。
 */

export const SKILL_DIR = 'skills/prompt-workbench';
export const SKILL_NAME = 'prompt-workbench';

/** 与渲染引擎共用同一条交付规则，避免 Skill 与网页给出不同口径。 */
export { UNIVERSAL_DELIVERY_RULE } from './core.js';
import { UNIVERSAL_DELIVERY_RULE } from './core.js';

const DESCRIPTION =
  '把模糊任务变成可直接使用的提示词：先选场景，再按固定问题清单逐个提问，最后渲染成成品提示词。' +
  '覆盖 20 个技术场景（需求澄清、调试、代码审查、重构、测试、API 对接、部署、技术选型、数据分析、技术调研、学习计划、Agent 任务、技术文档、写作等）。' +
  '当用户说"帮我写提示词""需求说不清""让 AI 干活效果不好""不知道怎么问 AI"时使用；也可被其他 agent 当作提示词生成器调用。';

function escapeCell(text) {
  return String(text || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function skillMd(scenes) {
  const lines = [];
  lines.push('---');
  lines.push(`name: ${SKILL_NAME}`);
  lines.push(`description: ${DESCRIPTION}`);
  lines.push('---');
  lines.push('');
  lines.push('# 提示词工作台（离线 Skill）');
  lines.push('');
  lines.push('把用户的一句话需求，变成一段**可以直接粘进任何 AI 使用**的提示词。');
  lines.push('');
  lines.push('## 优先级规则');
  lines.push('');
  lines.push('1. **如果环境里配置了 MCP 服务器 `prompt-workbench`**，直接用它的工具，不要读 references：');
  lines.push('   `recommend_scene` / `list_scenes` → `get_questionnaire` → `render_prompt`。');
  lines.push('2. 没有 MCP 时，按下面的本地流程走，按需读取 `references/scenes/<id>.md`。');
  lines.push('');
  lines.push('## 本地流程（严格按顺序）');
  lines.push('');
  lines.push('1. **选场景**：对照 `references/scenes-index.md` 匹配用户需求；匹配不到就问一句「你想解决哪类问题」并给出 3 个候选。');
  lines.push('2. **读该场景**：打开 `references/scenes/<id>.md`，里面有「问题清单」和「模板」。');
  lines.push('3. **逐个提问**：一次只问一个问题，等用户回答再问下一个。用户说「跳过 / 不知道」时，用推荐答案或默认假设继续，并明确标注「假设」。');
  lines.push('4. **渲染成品**：必填项齐了（或都已标为假设）之后，把模板里的 `{{key}}` 替换成用户回答的原文，输出成品提示词。');
  lines.push('5. **输出三段**：① 成品提示词（放在代码块里，方便复制）② 缺失项与假设 ③ 下一步建议。');
  lines.push('');
  lines.push('## 硬性约束');
  lines.push('');
  lines.push('- 不要一次抛出多个问题；每轮只问一个。');
  lines.push('- 不要编造用户没有提供的材料、数字、版本号；缺的地方写「待确认」。');
  lines.push('- 模板里的「（未提供，请先向用户确认）」在生成成品前必须被回答或标为假设。');
  lines.push('- **先给能用的最小版本，再列需要确认的信息（最多 3 条）；不要只追问不产出。**');
  lines.push('- 成品提示词必须包含：角色 / 任务 / 已知信息 / 输出格式 / 约束；不得掺入解释性废话。');
  lines.push('- 场景库的借鉴来源写在 `references/sources.md`，不要声称这些方法全部原创。');
  lines.push('');
  lines.push('## 场景索引');
  lines.push('');
  lines.push('| id | 场景 | 什么时候用 |');
  lines.push('| --- | --- | --- |');
  for (const scene of scenes) {
    lines.push(`| \`${scene.id}\` | ${escapeCell(scene.title)} | ${escapeCell(scene.whenToUse)} |`);
  }
  lines.push('');
  lines.push(`共 ${scenes.length} 个场景。新增场景请改 \`data/scenes/\`，然后跑 \`npm run build:skills\`，不要手改本文件。`);
  lines.push('');
  return lines.join('\n');
}

function indexMd(scenes) {
  const lines = [];
  lines.push('# 场景索引');
  lines.push('');
  lines.push('> 本文件由 `npm run build:skills` 从场景数据生成，不要手改。');
  lines.push('');
  lines.push('| id | 场景 | 分类 | 什么时候用 | 问题数 |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const scene of scenes) {
    lines.push(
      `| \`${scene.id}\` | ${escapeCell(scene.title)} | ${escapeCell(scene.category)} | ${escapeCell(scene.whenToUse)} | ${scene.questions.length} |`,
    );
  }
  lines.push('');
  lines.push('## 分类统计');
  lines.push('');
  const categories = {};
  for (const scene of scenes) categories[scene.category] = (categories[scene.category] || 0) + 1;
  for (const [category, count] of Object.entries(categories)) {
    lines.push(`- ${category}：${count} 个场景`);
  }
  lines.push('');
  return lines.join('\n');
}

function sceneMd(scene) {
  const lines = [];
  lines.push(`# ${scene.title}`);
  lines.push('');
  lines.push(`- **id**：\`${scene.id}\``);
  lines.push(`- **分类**：${scene.category}`);
  lines.push(`- **什么时候用**：${scene.whenToUse}`);
  if (scene.keywords && scene.keywords.length) {
    lines.push(`- **关键词**：${scene.keywords.join('、')}`);
  }
  lines.push('');
  lines.push('## 问题清单（按顺序，一次只问一个）');
  lines.push('');
  scene.questions.forEach((question, index) => {
    const required = question.required !== false ? '必填' : '可选';
    lines.push(`${index + 1}. \`${question.key}\`（${required}）：${question.ask}`);
    if (question.why) lines.push(`   - 为什么问：${question.why}`);
    if (question.examples && question.examples.length) {
      lines.push(`   - 示例回答：${question.examples.join(' / ')}`);
    }
  });
  lines.push('');
  lines.push('## 模板（把 {{key}} 替换成用户回答原文）');
  lines.push('');
  lines.push('````text');
  lines.push(scene.template);
  lines.push('````');
  lines.push('');
  lines.push('## 交付要求');
  lines.push('');
  lines.push('````text');
  lines.push(UNIVERSAL_DELIVERY_RULE);
  lines.push('````');
  lines.push('');
  lines.push('## 来源');
  lines.push('');
  for (const source of scene.sources) {
    lines.push(`- **${source.repo}**：借鉴了${source.what}；我改成：${source.how}`);
  }
  lines.push('');
  return lines.join('\n');
}

function sourcesMd(scenes) {
  const lines = [];
  lines.push('# 来源与致谢');
  lines.push('');
  lines.push('> 本文件由 `npm run build:skills` 从场景数据的 `sources` 字段生成，不要手改。');
  lines.push('');
  lines.push('| 场景 | 借鉴项目 | 借鉴了什么 | 我改了什么 |');
  lines.push('| --- | --- | --- | --- |');
  for (const scene of scenes) {
    for (const source of scene.sources) {
      lines.push(`| ${escapeCell(scene.title)} | ${escapeCell(source.repo)} | ${escapeCell(source.what)} | ${escapeCell(source.how)} |`);
    }
  }
  lines.push('');
  lines.push('借鉴的是思路与结构，不是代码；各项目原始代码许可证以各自仓库为准。');
  lines.push('');
  return lines.join('\n');
}

/** 返回 [{ path, content }]，path 相对仓库根目录。 */
export function buildSkillFiles(scenes) {
  const files = [
    { path: `${SKILL_DIR}/SKILL.md`, content: skillMd(scenes) },
    { path: `${SKILL_DIR}/references/scenes-index.md`, content: indexMd(scenes) },
    { path: `${SKILL_DIR}/references/sources.md`, content: sourcesMd(scenes) },
  ];
  for (const scene of scenes) {
    files.push({ path: `${SKILL_DIR}/references/scenes/${scene.id}.md`, content: sceneMd(scene) });
  }
  return files;
}
