/**
 * 场景：把一句话任务变成 AI 能执行的开发任务
 */
export default {
  id: 'coding-task',
  title: '把任务变成 AI 能执行的开发任务',
  category: '开发',
  icon: '🛠️',
  whenToUse:
    '要把一个开发任务交给 AI 写代码，但说太粗它乱改、说太细自己又费劲。',
  keywords: ['开发', '写代码', '重构', '修 bug', '仓库', '实现', '任务', '技术'],
  questions: [
    {
      key: 'task',
      ask: '要做什么？一句话说清要改什么、加什么。',
      why: 'AI 最怕的不是任务难，是任务边界不清。',
      required: true,
      examples: ['给项目加一个导出 CSV 的按钮', '把登录逻辑从 session 改成 token'],
    },
    {
      key: 'context',
      ask: '技术栈和现有结构是什么？关键文件/目录叫什么？',
      why: '不给上下文，AI 会自己发明一套结构。',
      required: true,
      examples: ['Node + Express，路由在 routes/，前端是原生 JS'],
    },
    {
      key: 'done',
      ask: '怎么算做完了？列出可验证的检查项（能跑什么命令、点什么按钮）。',
      why: '这是唯一能防止 AI「说完成了其实没完成」的东西。',
      required: true,
      examples: ['npm test 全绿', '点导出按钮能下载到 CSV，中文不乱码'],
    },
    {
      key: 'noGo',
      ask: '哪些东西不能碰？不能改的文件、必须保持兼容的行为、不能加的依赖。',
      why: '不写禁区，AI 会顺手重构你没让它动的地方。',
      required: true,
      examples: ['不要改数据库表结构', '不要新增依赖'],
    },
    {
      key: 'style',
      ask: '有没有必须遵守的代码风格或约定？',
      why: '风格不一致是后续维护成本的主要来源。',
      required: false,
      examples: ['用 ESM，不要 CommonJS', '函数不超过 50 行'],
    },
  ],
  template: `你是一位严谨的高级工程师。请先理解任务，再按下面的约束执行；不确定的地方先问我，不要猜。

## 任务
{{task}}

## 现有环境
{{context}}

## 完成标准（必须逐条验证）
{{done}}

## 禁区（不能改动的地方）
{{noGo}}

## 代码约定
{{style}}

## 执行规则
1. 先复述你理解的任务，并列出你打算改动的文件清单，等我确认后再动手。
2. 只改清单内的文件；需要改清单外的东西，先说明原因并征求同意。
3. 每完成一步，报告「当前状态 + 下一步」。
4. 完成后逐条对照「完成标准」自检，给出每一条的验证方式。
5. 不要为了「顺便优化」重构无关代码。`,
  outputFormat: 'markdown',
  sources: [
    {
      repo: 'f/awesome-chatgpt-prompts',
      what: '角色扮演 + 明确职责的写法',
      how: '只借角色设定一段，执行规则换成本项目自己的「先确认再动手」机制',
    },
    {
      repo: 'dair-ai/Prompt-Engineering-Guide',
      what: '分隔符分区、输出格式约束、要求模型先复述任务',
      how: '拆成 任务 / 环境 / 完成标准 / 禁区 / 约定 五个固定区',
    },
  ],
};
