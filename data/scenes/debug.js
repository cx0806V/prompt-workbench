/** 场景：报错卡住，让 AI 先定位再给方案 */
export default {
  id: 'debug',
  title: '报错了，帮我定位',
  category: '开发',
  icon: '🐛',
  whenToUse: '代码跑不起来、报错看不懂、或者行为和你预期不一样，卡了半小时以上。',
  keywords: ['报错', '调试', 'bug', '异常', '不生效', '跑不起来', 'crash', 'error'],
  questions: [
    {
      key: 'symptom',
      ask: '现象是什么？把报错原文/关键日志直接贴上来。',
      why: '报错原文比任何转述都准。',
      required: true,
      examples: ['TypeError: Cannot read properties of undefined (reading "map")，指向 app.js 第 42 行'],
    },
    {
      key: 'env',
      ask: '运行环境和技术栈是什么？版本号、命令、在哪个系统上跑的。',
      why: '同一个报错在不同版本里原因完全不同。',
      required: true,
      examples: ['Node 22 + Vite 6，Windows 11，npm run dev 时出现'],
    },
    {
      key: 'repro',
      ask: '怎么触发？能不能稳定复现？大概多久出现一次。',
      why: '不能复现的问题，先要做的是缩小范围。',
      required: true,
      examples: ['打开首页就必现', '连续点三次保存才出现，偶尔'],
    },
    {
      key: 'tried',
      ask: '你已经试过什么？结果分别是什么？',
      why: '避免 AI 让你重复做一遍你做过的事。',
      required: false,
      examples: ['清过缓存、换过浏览器、把那段代码注释掉就好了'],
    },
    {
      key: 'expect',
      ask: '你期望它做什么？现在实际做了什么？',
      why: '「不符合预期」必须写出两边，否则无法判断哪边错。',
      required: true,
      examples: ['期望列表显示 3 条数据，实际是空白'],
    },
  ],
  template: `你是一位资深调试工程师。先定位，再给方案；在我确认原因之前，不要直接重写我的代码。

## 现象
{{symptom}}

## 环境
{{env}}

## 复现方式
{{repro}}

## 期望 vs 实际
{{expect}}

## 已尝试
{{tried}}

## 你的任务
1. 用一句话复述问题（不是复述我的话，是你的理解）。
2. 按可能性从高到低列最多 3 个原因，每个原因给一个**能在 1 分钟内做的验证动作**。
3. 说明你判断的依据（哪个日志/哪行逻辑让你这么认为）。
4. 如果信息不够，直接问我最少需要补充的 1–2 条，不要瞎猜。
5. 只有在我确认原因后，才给修改方案；方案要说明会影响哪些文件。

## 禁止
- 不要一次性贴出「全部改好的代码」。
- 不要建议「重装环境 / 重装依赖」作为第一步。`,
  outputFormat: 'markdown',
  sources: [
    {
      repo: 'dair-ai/Prompt-Engineering-Guide',
      what: '把复杂任务拆成「先分析、再执行」的链式步骤',
      how: '把调试拆成定位→验证→修复三段，并禁止跳过定位直接改代码',
    },
    {
      repo: 'anthropics/prompt-eng-interactive-tutorial',
      what: '让模型先复述任务、指令与数据分离',
      how: '模板第 1 步强制复述问题，并把「现象/环境/复现」分成独立区块',
    },
  ],
};
