/** 场景：把 bug 变成别人能复现的 issue */
export default {
  id: 'bug-report',
  title: '把这个 bug 写成能复现的 issue',
  category: '开发',
  icon: '📝',
  whenToUse: '要提 issue / 向别人报障 / 交给 AI 修，但你现在只会说「它坏了」。',
  keywords: ['issue', 'bug报告', '复现', '提issue', '报障', '反馈', '提交'],
  questions: [
    {
      key: 'problem',
      ask: '哪里坏了？用一句话说，不要带情绪。',
      why: '一句话说清的 bug，才有可能被快速修。',
      required: true,
      examples: ['点保存后页面刷新，数据没存上'],
    },
    {
      key: 'steps',
      ask: '复现步骤？按顺序写，一步一个动作。',
      why: '能按步骤复现，是 bug 报告的第一价值。',
      required: true,
      examples: ['1 打开设置页 2 改昵称 3 点保存'],
    },
    {
      key: 'expect',
      ask: '预期是什么？实际是什么？两句话。',
      why: '没有对照，维护者无法判断是 bug 还是设计如此。',
      required: true,
      examples: ['预期昵称被保存并显示；实际刷新后变回旧昵称'],
    },
    {
      key: 'env',
      ask: '环境和版本？系统 / 浏览器 / 应用版本 / 提交号。',
      why: '同一 bug 在不同版本原因不同。',
      required: true,
      examples: ['Windows 11 / Edge 141 / 版本 v0.3 / commit ae8093b'],
    },
    {
      key: 'evidence',
      ask: '有截图、日志、报错原文吗？直接贴。',
      why: '证据能省掉一整轮来回追问。',
      required: false,
      examples: ['控制台有 POST /api/save 500，附截图'],
    },
  ],
  template: `你是一位开源项目维护者。请把我下面的描述整理成一份高质量的 issue，我可以直接复制提交。

## 我遇到的现象
{{problem}}

## 复现步骤
{{steps}}

## 预期 vs 实际
{{expect}}

## 环境
{{env}}

## 证据
{{evidence}}

## 输出要求
1. **标题**：一句话，包含「在什么条件下 / 什么坏了」，不要用「求助」「急」。
2. 按这个结构输出：环境 / 复现步骤（编号，每步一个动作）/ 预期行为 / 实际行为 / 证据 / 影响范围（多少人、什么场景受影响）。
3. 最后加一段「我猜测的原因」——标成**猜测**，不要说得像结论。
4. 去掉所有情绪化表达（「崩溃了」「气死」），只留可验证的事实。

## 禁止
- 不要编造我没有提供的日志或版本号。
- 不要替我把「猜测」写成「已知」。`,
  outputFormat: 'markdown',
  sources: [
    {
      repo: 'dair-ai/Prompt-Engineering-Guide',
      what: '用固定结构约束输出、把猜测与事实分开',
      how: '把 issue 结构写成固定五段，并强制标注「猜测」段',
    },
    {
      repo: 'zhouzilai626/clarify-idea-skill',
      what: '用「怎么判它正常」的口语化验收思路',
      how: '把预期/实际写成对照句，要求能被第三方复现',
    },
  ],
};
