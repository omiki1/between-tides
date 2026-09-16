## 它在解决什么

`stu_agent` 是一套按阶段走的 Agent 学习工程。目标不是背某个框架的 API，而是能判断：这件事该不该交给 LLM，该用固定工作流，还是真的需要一个会选工具的智能体。

学习顺序是固定的：原理 → 最小实现 → 框架实现 → 工程化 → 项目实战 → 调试 → 评测 → 架构。

## 里面有什么

- `docs/`：从全景、工具调用、Agent 循环、记忆、工作流，写到 Agentic RAG、MCP、多智能体、工程化和评测。
- `examples/`：离线也能跑的最小 Demo，不依赖第三方包。
- `projects/`：10 个参考实现，从 Tool Agent、ReAct、记忆、研究工作流、Agentic RAG，到 MCP、多智能体、FastAPI 服务、评测和带网页的研究助手。
- `memory/`、`tool/`、`middleware/`、`langGraph_stu/`：窗口记忆、摘要记忆、敏感词过滤、动态路由图这些可以单独打开的零件。

参考实现刻意保持小型，用来暴露边界，不是生产模板。

## 现在怎么用它

公开仓库在 [omiki1/agent-learning-engineering](https://github.com/omiki1/agent-learning-engineering)。资料已经一次性给齐，不等于已经掌握。仓库里的 `PROGRESS.md` 和 `ROADMAP.md` 用来记录自己走到哪一周。默认路径尽量离线；外部 SDK 是可选扩展，用之前要再对一次官方文档。

## 和后面怎么接

医疗工作台里的“受限 Agent”就是从这里长出来的判断：模型可以规划检索、观察缺口、选择改写或停止，但不能关掉证据门槛，也不能自己改回答模式。先会判断，再决定要不要让模型自己走。
