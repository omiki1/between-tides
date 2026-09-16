export type Project = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  tags: string[];
  status: string;
  visual: "graph" | "nodes" | "search" | "flow" | "stack";
  github?: string;
  demo?: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    id: "mediatlas",
    name: "MediAtlas",
    subtitle: "先找到依据，再开口解释。",
    description: "FastAPI + Vue 3 做对话的医学证据工作台。BM25、向量、同源图谱和重排接到同一条检索链上；权威模式只走已核验公开来源，探索模式才打开历史疾病文档。回答必须带出处，急症和个体剂量规则先于模型。本地可运行，未经临床验证。",
    tags: ["FastAPI", "Vue 3", "RAG", "Neo4j", "Agent"],
    status: "可运行原型",
    visual: "graph",
    featured: true,
    github: "https://github.com/omiki1/medical_agentic_rag",
  },
  {
    id: "disease-graph",
    name: "疾病知识图谱问答",
    subtitle: "把病、症、药放进一张图里。",
    description: "stu-neoj4 的图谱实验。以疾病为中心，接入症状、药物、科室、检查、宜忌食物等 8 类实体和 11 种关系；PaddleNLP 做抽取，GLM 把问句写成 Cypher，再交给带历史的问答链和可调度天气、图谱查询的 Agent。",
    tags: ["Neo4j", "PaddleNLP", "LangChain", "Cypher"],
    status: "图谱实验",
    visual: "nodes",
  },
  {
    id: "rag-lab",
    name: "RAG 检索实验",
    subtitle: "找到位置，只是理解的第一步。",
    description: "stu_rag 把检索拆开练：文本/PDF/图片加载、切分、Chroma 持久化、BM25、FlagEmbedding 向量化与重排、RRF 混合排序，最后接到 LangChain 问答链。后面 MediAtlas 里的多路召回，就是从这里接上去的。",
    tags: ["Chroma", "BM25", "RRF", "FlagEmbedding"],
    status: "检索实验",
    visual: "search",
  },
  {
    id: "agent-studio",
    name: "Agent 学习工程",
    subtitle: "先会判断，再决定要不要让模型自己走。",
    description: "stu_agent 按阶段把 Agent 从最小循环做到工程化：工具调用、ReAct、记忆、LangGraph 工作流、MCP、多智能体、评测和 FastAPI 服务。资料和 10 个可运行参考实现都在本地，用来想清楚何时用 LLM、何时用工作流、何时才上智能体。",
    tags: ["LangGraph", "MCP", "Memory", "ReAct"],
    status: "学习工程",
    visual: "flow",
    github: "https://github.com/omiki1/agent-learning-engineering",
  },
  {
    id: "fastapi-mailcode",
    name: "FastAPI 验证码服务",
    subtitle: "把接口、业务和数据分开。",
    description: "stu_fastapi 的邮件验证码模块。Controller / Service / DAO 分层，MySQL 查用户，SMTP 发 4 位验证码，Redis 存 60 秒后过期。同一套分层后来接到医疗系统的登录、注册和 JWT 鉴权里。",
    tags: ["FastAPI", "MySQL", "Redis", "SMTP"],
    status: "基础模块",
    visual: "stack",
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.id === slug);
}

export function projectNeighbours(slug: string) {
  const index = projects.findIndex((project) => project.id === slug);
  return {
    previous: index > 0 ? projects[index - 1] : undefined,
    next: index >= 0 && index < projects.length - 1 ? projects[index + 1] : undefined,
  };
}
