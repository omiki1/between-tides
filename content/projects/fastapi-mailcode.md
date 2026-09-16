## 它在解决什么

`stu_fastapi` 练的是后端最常见的一件小事：给邮箱发验证码，并在短时间内校验。它把接口、业务和数据访问分开，后面医疗系统的登录、注册和 JWT 鉴权，用的是同一套分层。

## 已经能跑的接口

| 接口 | 路径 | 行为 |
| --- | --- | --- |
| 发送验证码 | `GET /users/sendEmail` | 生成 4 位数字，SMTP 发出去，Redis 按邮箱存 60 秒 |
| 校验验证码 | `GET /users/verifyEmail` | 从 Redis 取出比对，成功后删除 key |

请求进 `UsersController`，业务在 `UsersService`，查邮箱是否存在走 `UsersDao` + MySQL，验证码只进 Redis。配置用 `.env`，LLM 加载模块当时已经放进 `ai/`，但验证码这条链路并不依赖模型。

## 为什么值得单独留下

分层看起来无聊，接上完整系统之后才知道它省事：Controller 不关心 Redis 怎么过期，Service 不关心 SQL 怎么写，DAO 不关心邮件正文。医疗仓库里的 `auth` / `user` 模块，就是在这套 Controller → Service → DAO 上继续长出来的。

当时还没做完注册、登录和重置密码的完整接口，Pydantic 实体也不齐。这些在 `medical_disease_db` 里才补上：密码哈希、JWT、角色权限、Redis 黑名单。

## 和后面怎么接

MediAtlas 的账户体系仍然是这套骨架。验证码只解决“这封邮件现在是你的”；医疗问答另外还要会话隔离、轨迹落库和访客过期。接口练习到此为止，领域规则要放到更上面那一层。
