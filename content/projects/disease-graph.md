## 它在解决什么

`stu-neoj4` 是把医疗问答从“关键词匹配”换成“图上推理”的练习。传统检索很难跨实体：一种病连着症状、药物、科室、宜吃和忌吃。把这些写成 Neo4j 里的点和边，再用大模型把自然语言转成 Cypher，问答才有可检查的路径。

## 图长什么样

图谱以疾病为中心，辐射 8 类实体、11 种关系：

| 节点 | 关系 |
| --- | --- |
| Disease → Symptom | `DISEASE_SYMPTOM` |
| Disease → Check / Cureway / Drug / Department | 检查、疗法、药物、科室 |
| Disease → Food / Dishes | 宜吃 `DISEASE_DO_EAT`、忌吃 `DISEASE_NOT_EAT` |
| Disease → Category | 分类 |

建库脚本在 `create_data/`，节点和关系从 CSV 写入。连接封装在 `Util/Neo4jUtil.py`。

## 从问句到回答

练习是按脚本拆开的，不是一上来就做完整服务：

- PaddleNLP 的 PP-UIE / uie-base 做命名实体识别。
- GLM 把抽取结果或用户提问写成 Cypher。
- 一条带历史的问答链：生成查询 → 执行 → 组织回答，并做医疗 / 非医疗意图分流，减少凭空编造。
- 高德天气和图谱查询封装成 LangChain Tool，交给 `create_agent` 自己调度。

它证明“自然语言 → 图查询 → 回答”这条路走得通，但还停在脚本和原型，没有登录、没有前端，也没有后来 MediAtlas 里的证据门槛。

## 和后面怎么接

MediAtlas 沿用了疾病图谱，但把任意 Cypher 收成参数化只读查询。检索不再只靠图，而是图、BM25 和向量一起走。这个练习留下的是实体关系和“先查图、再说话”的习惯。
