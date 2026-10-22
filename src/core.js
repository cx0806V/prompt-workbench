/**
 * 纯函数核心。
 *
 * 约束（防屎山三条规则之一）：本文件不依赖 Node / 浏览器 / Cloudflare 的任何 API，
 * 因此 MCP Server、Skill 构建脚本、网页工作台三个壳可以共用同一份逻辑，且能直接单测。
 */

export const VERSION = '0.2.1';

/**
 * 通用交付规则：所有场景渲染时自动附加。
 *
 * 来源：2026-10-20 程翔父亲实测反馈——AI 拿到"用 PLC 写一段跑马灯程序"的提示词后，
 * 只列缺失和假设、不给代码，用户拿不到能用的东西。
 * 结论：工具不能只会追问，必须先给能用的初版，再列需要确认的信息。
 */
export const UNIVERSAL_DELIVERY_RULE = [
  '## 通用交付规则（自动附加，优先级高于上面的表述）',
  '- 如果我要的是「一个结果」（代码、程序、文案、方案、清单、报告）：**先给一版能直接用的最小版本**；缺的参数用默认假设填上并标注「假设」，不要因为信息不全就只问不产出。',
  '- 如果我要的是「改我现有的仓库/文件/系统」：先列改动清单等我确认，再动手。',
  '- 需要我补充的信息最多 3 条，放在结果之后，不要放在最前面。',
].join('\n');

const SCENE_FIELDS = ['id', 'title', 'category', 'whenToUse', 'questions', 'template', 'sources'];
const QUESTION_FIELDS = ['key', 'ask'];

/** 校验单个场景，返回错误字符串数组；空数组 = 合法。 */
export function validateScene(scene) {
  const errors = [];
  if (!scene || typeof scene !== 'object' || Array.isArray(scene)) {
    return ['场景必须是一个对象'];
  }
  for (const field of SCENE_FIELDS) {
    if (scene[field] === undefined || scene[field] === null || scene[field] === '') {
      errors.push(`缺少字段 ${field}`);
    }
  }
  if (scene.id && !/^[a-z0-9][a-z0-9-]*$/.test(scene.id)) {
    errors.push(`id 只能用小写字母、数字、连字符：${scene.id}`);
  }
  if (scene.sources !== undefined && (!Array.isArray(scene.sources) || scene.sources.length === 0)) {
    errors.push('sources 不能为空：借鉴了谁必须写清楚');
  }
  if (!Array.isArray(scene.questions) || scene.questions.length === 0) {
    errors.push('questions 必须是非空数组');
    return errors;
  }
  const keys = new Set();
  scene.questions.forEach((question, index) => {
    for (const field of QUESTION_FIELDS) {
      if (!question || !question[field]) errors.push(`questions[${index}] 缺少 ${field}`);
    }
    if (!question || !question.key) return;
    if (keys.has(question.key)) errors.push(`questions[${index}] 的 key 重复：${question.key}`);
    keys.add(question.key);
    if (typeof scene.template === 'string' && !scene.template.includes(`{{${question.key}}}`)) {
      errors.push(`模板里没有占位符 {{${question.key}}}`);
    }
  });
  return errors;
}

/** 校验场景集合：逐个校验 + id 唯一。返回 { ok, errors }。 */
export function validateScenes(scenes) {
  const errors = [];
  if (!Array.isArray(scenes) || scenes.length === 0) {
    return { ok: false, errors: ['场景集合必须是非空数组'] };
  }
  const ids = new Set();
  for (const scene of scenes) {
    const sceneErrors = validateScene(scene);
    for (const error of sceneErrors) errors.push(`${scene && scene.id ? scene.id : '未知场景'}: ${error}`);
    if (scene && scene.id) {
      if (ids.has(scene.id)) errors.push(`id 重复：${scene.id}`);
      ids.add(scene.id);
    }
  }
  return { ok: errors.length === 0, errors };
}

/** 列出场景（不含完整模板，保证返回体积小）。 */
export function listScenes(scenes, options = {}) {
  const { category, keyword } = options;
  return scenes
    .filter((scene) => {
      if (category && scene.category !== category) return false;
      if (keyword) {
        const haystack = [scene.title, scene.category, scene.whenToUse, ...(scene.keywords || [])].join(' ');
        if (!haystack.includes(keyword)) return false;
      }
      return true;
    })
    .map(toSummary);
}

function toSummary(scene) {
  return {
    id: scene.id,
    title: scene.title,
    category: scene.category,
    icon: scene.icon || '',
    whenToUse: scene.whenToUse,
    questionCount: Array.isArray(scene.questions) ? scene.questions.length : 0,
  };
}

/** 取单个场景。 */
export function findScene(scenes, id) {
  return scenes.find((scene) => scene.id === id) || null;
}

/** 取某场景的问卷（给 AI 用来逐步提问）。 */
export function getQuestionnaire(scenes, id) {
  const scene = findScene(scenes, id);
  if (!scene) return null;
  return {
    sceneId: scene.id,
    title: scene.title,
    whenToUse: scene.whenToUse,
    questions: scene.questions.map((question) => ({
      key: question.key,
      ask: question.ask,
      required: question.required !== false,
      examples: question.examples || [],
      why: question.why || '',
    })),
  };
}

/** 中文二字组，用于模糊匹配（英文/数字跳过）。 */
function bigrams(text) {
  const chars = Array.from(String(text || ''));
  const result = new Set();
  for (let i = 0; i < chars.length - 1; i += 1) {
    const pair = chars[i] + chars[i + 1];
    if (/[\u4e00-\u9fa5]{2}/.test(pair)) result.add(pair);
  }
  return result;
}

/** 关键词命中：中文直接包含；英文转小写比较（用户常把 README / CSV / API 写成大写）。 */
function keywordHit(queryLower, keyword) {
  if (!keyword) return false;
  return queryLower.includes(String(keyword).toLowerCase());
}

/**
 * 场景检索语料：标题 + 分类 + 适用场景 + 关键词 + 每个问题的「示例说法」。
 *
 * 2026-10-20 实测 bug：用户原话「给我这个网页加一个导出 CSV 的按钮」召回为空。
 * 原因：示例说法（examples）本来就是用户会说的原话，但原实现没把它纳入匹配语料。
 */
function sceneSearchText(scene) {
  const examples = (scene.questions || []).flatMap((question) =>
    Array.isArray(question.examples) ? question.examples : []
  );
  return [scene.title, scene.category, scene.whenToUse, (scene.keywords || []).join(' '), ...examples].join(' ');
}

/** 关键词匹配场景，返回按相关性排序的候选（给「我只有一句话，用哪个场景」用）。 */
export function matchScenes(scenes, text) {
  const query = String(text || '').trim();
  if (!query) return [];
  const queryBigrams = bigrams(query);
  const queryLower = query.toLowerCase();

  return scenes
    .map((scene) => {
      let score = 0;
      if (scene.title && query.includes(scene.title)) score += 5;
      if (scene.category && query.includes(scene.category)) score += 2;
      if (scene.whenToUse && query.length >= 4 && scene.whenToUse.includes(query)) score += 3;
      for (const keyword of scene.keywords || []) {
        if (keywordHit(queryLower, keyword)) score += 2;
      }
      // 兜底：关键词没命中时，用二字组重合度判断（中文口语描述常常不含关键词）
      const sceneText = sceneSearchText(scene);
      let shared = 0;
      for (const pair of bigrams(sceneText)) {
        if (queryBigrams.has(pair)) shared += 1;
      }
      if (shared >= 3) score += Math.min(shared, 6);
      return { scene: toSummary(scene), score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.scene);
}

/**
 * 渲染成品提示词。
 * 返回 { sceneId, prompt, missing, warnings }：
 *  - missing：必填但没给的 key
 *  - warnings：非必填缺失 / 未知 key 等提示
 */
export function renderPrompt(scenes, id, answers = {}) {
  const scene = findScene(scenes, id);
  if (!scene) return { sceneId: id, prompt: '', missing: [], warnings: [`场景不存在：${id}`] };

  const missing = [];
  const warnings = [];
  const known = new Set(scene.questions.map((question) => question.key));

  for (const question of scene.questions) {
    const value = answers ? answers[question.key] : undefined;
    const empty = value === undefined || value === null || String(value).trim() === '';
    if (empty) {
      if (question.required !== false) missing.push(question.key);
      else warnings.push(`可选项未填：${question.key}`);
    }
  }
  for (const key of Object.keys(answers || {})) {
    if (!known.has(key)) warnings.push(`未知字段被忽略：${key}`);
  }

  let prompt = scene.template;
  for (const question of scene.questions) {
    const raw = answers ? answers[question.key] : undefined;
    const value = raw === undefined || raw === null || String(raw).trim() === ''
      ? '（未提供，请先向用户确认）'
      : String(raw).trim();
    prompt = prompt.split(`{{${question.key}}}`).join(value);
  }

  return { sceneId: scene.id, prompt: `${prompt.trim()}\n\n${UNIVERSAL_DELIVERY_RULE}`, missing, warnings };
}

/** 场景库统计，给 /health 和 README 用。 */
export function sceneStats(scenes) {
  const categories = {};
  for (const scene of scenes) {
    categories[scene.category] = (categories[scene.category] || 0) + 1;
  }
  return {
    version: VERSION,
    sceneCount: scenes.length,
    categories,
    questionCount: scenes.reduce((sum, scene) => sum + scene.questions.length, 0),
  };
}
