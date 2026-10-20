/** 场景：技术文档写作 */
export default {
  id: 'tech-doc',
  title: '帮我写技术文档 / README',
  category: '写作',
  icon: '📚',
  whenToUse: '项目要给人看，但没有 README；或者要写设计文档、接口文档、周报。',
  keywords: ['readme', '文档', '技术文档', '设计文档', '接口文档', '周报', '说明'],
  questions: [
    {
      key: 'type',
      ask: '要写哪种？README / 设计文档 / 接口文档 / 周报 / 答辩材料。',
      why: '不同文档的结构完全不同。',
      required: true,
      examples: ['给一个开源仓库写 README'],
    },
    {
      key: 'reader',
      ask: '给谁看？他们会用它做什么？',
      why: '读者决定写什么、省略什么。',
      required: true,
      examples: ['给路过的人看，30 秒内决定要不要 star'],
    },
    {
      key: 'facts',
      ask: '必须包含的事实：项目做什么、怎么跑、测试情况、技术栈、局限。',
      why: '没有事实的文档只能写成空话。',
      required: true,
      examples: ['3 个场景 / 20 项测试全过 / 零依赖 / 需要 Node 20+'],
    },
    {
      key: 'length',
      ask: '要多长？有没有格式要求。',
      why: 'README 写太长没人读，写太短说不清。',
      required: false,
      examples: ['README 控制在 150 行内，要有安装命令和截图位置'],
    },
  ],
  template: `你是一位技术写作者。先给大纲让我确认，再写正文；正文里每个判断都要有事实支撑。

## 文档类型
{{type}}

## 读者与用途
{{reader}}

## 必须包含的事实
{{facts}}

## 长度与格式
{{length}}

## 输出要求
1. **先给大纲**（5–8 个标题），说明每个部分解决读者的什么问题。
2. 我确认后再写正文；正文遵守：一句话说清的别写两句，不写「随着……的发展」。
3. 需要数字的地方只能用我给的，缺的地方写「待补充」，不要编。
4. 写完做一次自检：删掉任何一段，读者会不会看不懂？不会就删。
5. 最后列出「读者最可能问的 3 个问题」，并确认文中已能回答。

## 禁止
- 不要写营销腔和空泛的价值主张。
- 不要为了完整而堆砌不存在的功能。`,
  outputFormat: 'markdown',
  sources: [
    {
      repo: 'f/prompts.chat',
      what: '角色设定与「先大纲后正文」的写作流程',
      how: '借角色与流程，禁止空话的规则换成中文常见套话清单',
    },
    {
      repo: 'dair-ai/Prompt-Engineering-Guide',
      what: '限定只使用给定事实、输出格式约束',
      how: '强制「数字只能用提供的」，缺的地方标待补充',
    },
  ],
};
