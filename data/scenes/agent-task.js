/** 场景：把任务交给 AI Agent */
export default {
  id: 'agent-task',
  title: '把这个任务交给 AI Agent 去执行',
  category: '开发',
  icon: '🤖',
  whenToUse: '想让编码 Agent（CodeBuddy / Cursor / Claude Code 等）帮你做一件完整的事，但怕它乱改。',
  keywords: ['agent', '自动执行', '交给ai', '任务说明', 'agents.md', 'claude code', 'cursor'],
  questions: [
    {
      key: 'task',
      ask: '要它做什么？描述最终结果，不要描述步骤。',
      why: 'Agent 需要目标，不需要你替它规划每一步。',
      required: true,
      examples: ['给项目加一个导出 CSV 的按钮，并且不破坏现有测试'],
    },
    {
      key: 'repo',
      ask: '在哪个仓库/目录做？关键文件、入口、怎么跑起来。',
      why: 'Agent 最贵的错误是找错文件、改错地方。',
      required: true,
      examples: ['仓库根目录，入口 index.html + app.js，npm test 跑测试'],
    },
    {
      key: 'rules',
      ask: '禁区是什么？不能改的文件、不能加的依赖、必须保持的行为。',
      why: '不写禁区，Agent 会顺手重构。',
      required: true,
      examples: ['不许改测试文件，不许新增依赖，接口返回结构不能变'],
    },
    {
      key: 'done',
      ask: '验收标准？能跑什么命令、点什么按钮算完成。',
      why: '这是 Agent 停止的唯一信号。',
      required: true,
      examples: ['npm test 全绿；点导出能下载中文不乱码的 CSV'],
    },
    {
      key: 'checkpoint',
      ask: '希望它什么时候停下来问你？',
      why: '事先约定检查点，比事后回滚便宜。',
      required: false,
      examples: ['改超过 3 个文件前先告诉我', '要装东西前先问我'],
    },
  ],
  template: `你是一个受约束的编码 Agent。请按下面的任务说明执行；每完成一步报告状态，遇到检查点必须停下来等我确认。

## 目标
{{task}}

## 工作环境
{{repo}}

## 禁区
{{rules}}

## 验收标准
{{done}}

## 检查点
{{checkpoint}}

## 执行规则
1. 开始前：用 3 句话复述你理解的目标、你打算改的文件清单、你不打算碰的部分。
2. 动手前等我确认文件清单（除非清单为空）。
3. 每次只做清单里的一件事；做完报告「改了什么 / 现在状态 / 下一步」。
4. 做完后逐条对照验收标准自检，给出每条的证据（命令输出或操作路径）。
5. 任何需要新增依赖、改数据库结构、改接口的行为，必须先问。
6. 不相关代码不要顺手优化。

## 交付
最后输出一段「变更摘要」，我可以直接复制进 commit message。`,
  outputFormat: 'markdown',
  sources: [
    {
      repo: 'anthropics/skills',
      what: 'SKILL.md 式的任务说明与执行约束写法',
      how: '借「目标+规则+验收」结构，改成 Agent 任务说明模板',
    },
    {
      repo: 'obra/superpowers',
      what: '先澄清再执行、分块确认的 Agent 工作法',
      how: '把「先复述再动手 + 检查点」写进执行规则',
    },
  ],
};
