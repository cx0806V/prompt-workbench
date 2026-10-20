# 来源与致谢

> 本文件由 `npm run build:skills` 从场景数据的 `sources` 字段生成，不要手改。

| 场景 | 借鉴项目 | 借鉴了什么 | 我改了什么 |
| --- | --- | --- | --- |
| 把模糊需求说清楚 | ttmouse/skills · requirements-clarifier | 6 槽位 Definition Card + 最少追问 + 默认假设 | 压缩成 5 个问题，去掉术语，改成中文大白话；默认假设合并进模板第 2 步 |
| 把模糊需求说清楚 | ChatPRD | 验收标准与用户故事的写法 | 不单独设「用户故事」字段，把验收标准并进第 4 问，保持问题数最少 |
| 把模糊需求说清楚 | dair-ai/Prompt-Engineering-Guide | 明确任务、指定输出格式、用分隔符分区 | 模板固定成「已知信息 / 任务 / 输出格式」三段 |
| 把任务变成 AI 能执行的开发任务 | f/awesome-chatgpt-prompts | 角色扮演 + 明确职责的写法 | 只借角色设定一段，执行规则换成本项目自己的「先确认再动手」机制 |
| 把任务变成 AI 能执行的开发任务 | dair-ai/Prompt-Engineering-Guide | 分隔符分区、输出格式约束、要求模型先复述任务 | 拆成 任务 / 环境 / 完成标准 / 禁区 / 约定 五个固定区 |
| 把一句话要求变成写作提示词 | f/awesome-chatgpt-prompts | 角色设定 + 禁止空话的约束写法 | 角色换成「删空话的写作助手」，禁止项改成中文常见套话清单 |
| 把一句话要求变成写作提示词 | dair-ai/Prompt-Engineering-Guide | 给出参考材料、限定只用已提供事实 | 把「材料」设为必填项，模板里硬性规定不许补编数字 |
| 报错了，帮我定位 | dair-ai/Prompt-Engineering-Guide | 把复杂任务拆成「先分析、再执行」的链式步骤 | 把调试拆成定位→验证→修复三段，并禁止跳过定位直接改代码 |
| 报错了，帮我定位 | anthropics/prompt-eng-interactive-tutorial | 让模型先复述任务、指令与数据分离 | 模板第 1 步强制复述问题，并把「现象/环境/复现」分成独立区块 |
| 帮我审这段代码 | dair-ai/Prompt-Engineering-Guide | 用明确输出格式约束模型、分级组织结论 | 把审查结果固定成三级 + 每条三段式结构，避免只给「好/不好」 |
| 帮我审这段代码 | promptfoo/promptfoo | 断言式检查清单 | 把「必须改/建议改」当成断言分级，限制条数，防止刷屏 |
| 这段代码该重构了，给我一个计划 | dair-ai/Prompt-Engineering-Guide | 复杂任务拆链（chaining）与分步执行 | 把重构拆成「可单独提交的 3–6 步」，每步强制测试全绿 |
| 这段代码该重构了，给我一个计划 | ckelsoe/prompt-architect | 先选框架、再填约束，避免模型自由发挥 | 模板先固定「诊断→分步→风险→不做」，再让模型填内容 |
| 帮我想测试用例 | promptfoo/promptfoo | 矩阵式用例 + 断言（assert）驱动的评测 | 把测试用例表做成矩阵，并要求给最难用例写断言代码 |
| 帮我想测试用例 | zhouzilai626/clarify-idea-skill | 用白话写「怎么算验收通过」 | 每个用例必须有可观察的预期结果，不许写「正常」两个字 |
| 要对接一个第三方 API，怎么开始 | dair-ai/Prompt-Engineering-Guide | 结构化输出 + 用分隔符定义输入区域 | 把「调用链路/鉴权/示例/错误/验证」固定为五段输出 |
| 要对接一个第三方 API，怎么开始 | f/prompts.chat | 角色设定（资深后端工程师）提升领域口吻 | 只借角色设定一段，其余规则全部按本项目重写 |
| 让 AI 把这段代码讲清楚 | langgptai/LangGPT | 结构化提示词模块（Role / Workflow / Output） | 借它的模块化结构，把讲解拆成结论、调用链、数据结构、取舍四块 |
| 让 AI 把这段代码讲清楚 | anthropics/prompt-eng-interactive-tutorial | 要求模型先给结论、再给证据，减少幻觉 | 规定每节必须带行号佐证，看不出来就明说 |
| 把这个 bug 写成能复现的 issue | dair-ai/Prompt-Engineering-Guide | 用固定结构约束输出、把猜测与事实分开 | 把 issue 结构写成固定五段，并强制标注「猜测」段 |
| 把这个 bug 写成能复现的 issue | zhouzilai626/clarify-idea-skill | 用「怎么判它正常」的口语化验收思路 | 把预期/实际写成对照句，要求能被第三方复现 |
| 它太慢了，怎么优化 | dair-ai/Prompt-Engineering-Guide | 让模型按步骤推理、先收集证据再下结论 | 把「先测量」设为输出第 1 步，禁止直接给优化方案 |
| 它太慢了，怎么优化 | promptfoo/promptfoo | 用可量化指标而不是感觉来评估 | 要求每个方案标注预期收益量级与代价 |
| 帮我做一次安全自查 | dair-ai/Prompt-Engineering-Guide | 风险分级与可验证输出 | 强制每条风险都给「验证方法」，避免只列名词 |
| 帮我做一次安全自查 | ttmouse/requirements-clarifier | 最少追问 + 默认假设的交互模型 | 借它的「先确认范围再展开」思路，把反问压到 4 个 |
| 把这个项目部署上线（带自动测试） | dair-ai/Prompt-Engineering-Guide | 分步执行 + 明确的输出格式 | 把部署拆成「结论/首次步骤/CI/验证/回滚」五段固定输出 |
| 把这个项目部署上线（带自动测试） | promptfoo/promptfoo | CI 里跑校验的思路 | CI 部分只保留「push 后跑测试」这一件事，避免臃肿 |
| 这个技术选型，帮我做决定 | ckelsoe/prompt-architect | 先选框架、再填内容，避免模型泛泛而谈 | 强制用 ADR 框架输出，禁止开放式回答 |
| 这个技术选型，帮我做决定 | dair-ai/Prompt-Engineering-Guide | 不确定信息要显式标注 | 表格里所有数字必须标来源或用「待核实」 |
| 这堆数据，帮我分析出结论 | dair-ai/Prompt-Engineering-Guide | 把任务拆成可执行步骤、要求给依据 | 强制「指标定义→质量检查→步骤→结论+证据」四段 |
| 这堆数据，帮我分析出结论 | promptfoo/promptfoo | 用可验证的断言代替主观判断 | 每个结论必须带支撑数字，否则不许写 |
| 帮我调研这几个东西，给个结论 | dair-ai/Prompt-Engineering-Guide | 明确输出格式、区分事实与推测 | 强制「结论→对比表→适用/不适用→依据→验证」结构 |
| 帮我调研这几个东西，给个结论 | clarify-idea-skill | 把模糊问题收窄成能判断的问题 | 第一个问题就要求具体到对象，防止范围过大 |
| 帮我排一个学新技术的计划 | dair-ai/Prompt-Engineering-Guide | 从基础到进阶的分层路径 | 借「分层学习」结构，但把每一层绑上可验证产物 |
| 帮我排一个学新技术的计划 | anthropics/prompt-eng-interactive-tutorial | 每章带练习与失败模式 | 每阶段强制配「最常见的坑 + 检验方式」 |
| 把这个任务交给 AI Agent 去执行 | anthropics/skills | SKILL.md 式的任务说明与执行约束写法 | 借「目标+规则+验收」结构，改成 Agent 任务说明模板 |
| 把这个任务交给 AI Agent 去执行 | obra/superpowers | 先澄清再执行、分块确认的 Agent 工作法 | 把「先复述再动手 + 检查点」写进执行规则 |
| 帮我写技术文档 / README | f/prompts.chat | 角色设定与「先大纲后正文」的写作流程 | 借角色与流程，禁止空话的规则换成中文常见套话清单 |
| 帮我写技术文档 / README | dair-ai/Prompt-Engineering-Guide | 限定只使用给定事实、输出格式约束 | 强制「数字只能用提供的」，缺的地方标待补充 |
| 把我的任务变成一段提示词 | langgptai/LangGPT | 结构化提示词模块（Role / Profile / Rules / Workflow） | 压缩成 6 个必填区块，并要求总长不超过 300 字 |
| 把我的任务变成一段提示词 | ckelsoe/prompt-architect | 框架选择 + 评分 + 渐进追问 | 把「以前常犯的错」变成约束区块，替代评分环节 |
| 把我的任务变成一段提示词 | dair-ai/Prompt-Engineering-Guide | 角色、分隔符、输出格式、自检 | 直接落到模板的 6 个区块里 |

借鉴的是思路与结构，不是代码；各项目原始代码许可证以各自仓库为准。
