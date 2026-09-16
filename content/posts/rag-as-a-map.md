---
title: "把知识库想象成一张地图"
description: "关于 RAG 的一个直觉：找到位置，只是理解的第一步。"
date: "2026-09-12"
tags: ["AI", "Learning"]
cover: "/gallery/deep-tide.webp"
featured: false
---

这是一篇概念示例笔记。面对散落在文档里的知识，我们首先想做的通常是搜索。检索增强生成（RAG）把找到的资料交给语言模型，帮助回答具体问题。

## 找到，不等于理解

可以把每一段文档想成地图上的一个位置。检索给出可能的目的地，但两点之间的关系依然需要阅读和判断。

最简单的向量相似度写作：

$$
\operatorname{sim}(a,b)=\frac{a\cdot b}{\|a\|\|b\|}
$$

这个数值衡量向量方向的接近程度，不代表资料内容一定正确。

## 一个可检查的流程

```typescript
type Evidence = { text: string; source: string };
function collectSources(chunks: Evidence[]) {
  return [...new Set(chunks.map(chunk => chunk.source))];
}
```

- 保留每段证据的原始出处。
- 当资料相互矛盾时，让矛盾可见。
- 缺少证据时，允许答案停在“不知道”。

> [!TIP]
> 先用一组自己熟悉的问题检查检索结果，再考虑更复杂的 Agent 流程。

## 把好问题留下来

一个知识库的价值，不只是已有答案的数量。那些能暴露盲点的问题，也应该成为地图的一部分。
