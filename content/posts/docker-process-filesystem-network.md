---
title: "把 Docker 用在生产：构建、降权与故障排查"
description: "一份能直接放进 CI 的 Dockerfile，加上镜像瘦身、非 root 运行、信号处理、健康检查与运行时排障的实际做法。"
date: "2026-09-16"
tags: ["Engineering", "Docker"]
category: "Engineering"
cover: "/posts/docker-layers.webp"
featured: true
---

"在我机器上是好的"这句话之所以成立，是因为我们交付的东西往往不完整。源代码交付了，依赖版本没交付；依赖版本交付了，系统库没交付；系统库交付了，运行时配置没交付。

容器要做的事情是把应用和它运行所需的整个用户态环境打包成一个不可变产物。但把代码塞进容器只是起点。真正决定这套东西好不好维护的，是构建速度、镜像体积、运行权限、信号处理、健康检查和故障时的可观测性。

下面按这六件事展开，每一条都给出可以照着改的做法。

![容器分层的叠加关系](/posts/docker-layers.webp "803x1043")

## 一、先纠正一个会导致容器立刻退出的误解

容器不是小虚拟机。它没有自己的内核，只是被命名空间和 cgroup 限制过的一个进程。这条差别带来一个非常具体的后果：**容器的一生由 PID 1 决定，PID 1 退出容器就结束。**

所以在 Dockerfile 里写这两种东西，容器会启动后立刻退出：

```dockerfile
# 错误一：这条命令启动完后台服务自己就返回了，PID 1 结束，容器结束
RUN service nginx start

# 错误二：CMD 写成了 RUN，构建期执行一次，运行期没有主进程
RUN node server.js
```

正确的形态是让主进程留在前台，成为 PID 1：

```dockerfile
CMD ["nginx", "-g", "daemon off;"]
```

### 信号处理：容器停止每次都要等 10 秒的原因

PID 1 在 Linux 里有特殊语义，内核对它默认忽略没有显式注册处理函数的信号。如果 PID 1 是个不处理信号的程序，`docker stop` 发来的 `SIGTERM` 会被丢掉，容器只能等默认的 10 秒超时后被 `SIGKILL` 强杀。

这个问题的表现非常有特征：**每次停止都恰好等 10 秒，而且应用里的优雅关闭逻辑从来没执行过**，日志里看不到任何关闭相关输出。

两种修法：

```dockerfile
# 首选：exec 形式，应用直接成为 PID 1
CMD ["node", "server.js"]

# 需要 shell 形式（比如要展开环境变量）时，用 exec 把进程顶上去
CMD ["sh", "-c", "exec node server.js"]

# 或者引入一个 init 进程负责转发信号和回收僵尸进程
ENTRYPOINT ["tini", "--"]
CMD ["node", "server.js"]
```

`exec` 的作用是用目标进程替换当前 shell 进程，而不是新建子进程。少了它，PID 1 是 shell，应用只是它的孩子，信号传不到。

判断有没有这个问题的办法很直接：启动容器，`docker stop` 计时。如果稳定在 10 秒左右，就是这里的问题。

## 二、构建：让 CI 里的第二次构建快起来

镜像是一叠只读层，每条会改动文件系统的指令产生一层。缓存按层匹配，**某一层失效，它之上的所有层都要重建**。这句话决定了 Dockerfile 里指令的顺序。

```dockerfile
# 慢：代码改一个字，依赖全部重装
COPY . .
RUN npm ci

# 快：依赖清单没变时，npm ci 这层直接命中缓存
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
```

原因是第一版里 `COPY . .` 在依赖安装之前，源码一变这层的哈希就变，后面的安装层跟着失效。第二版把变化频繁的源码放到最后，日常改代码只重建最后两层。

同样的思路适用于所有"下载或编译"类操作。系统包、语言依赖、构建产物各自独立成层，不要合成一条 `RUN` 把所有事做完，否则改任何一处都会连带重建全部。

CI 环境里还有两个能显著提速的做法。

**构建缓存跨流水线复用。** 默认的构建缓存只存在于本机，CI 每次跑在干净容器里等于永远没有缓存。用 BuildKit 把缓存导出到镜像仓库：

```bash
docker buildx build \
  --cache-from type=registry,ref=<registry>/<image>:buildcache \
  --cache-to type=registry,ref=<registry>/<image>:buildcache,mode=max \
  -t <registry>/<image>:<tag> \
  --push .
```

`mode=max` 表示导出所有中间层，不只是最终层。对多阶段构建这很重要，否则构建阶段的缓存带不过去，等于白配。

**平台参数显式声明。** 没声明 `TARGETARCH` 时，在 Apple Silicon 上构建 amd64 镜像会走模拟层，慢好几倍，某些原生模块还可能编译失败：

```dockerfile
FROM --platform=$BUILDPLATFORM node:22-slim AS build
ARG TARGETARCH
RUN echo "building for ${TARGETARCH}"
```

## 三、体积：多阶段构建与基础镜像的选择

单阶段构建会把编译器、开发依赖、测试框架、源码全部留在镜像里。多阶段构建把它们和运行时产物分开：

```dockerfile
# ---------- 构建阶段 ----------
FROM node:22-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# 生产依赖装到干净目录，避免把开发依赖带过去
RUN npm ci --omit=dev --ignore-scripts

# ---------- 运行阶段 ----------
FROM node:22-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

| 方案 | 镜像内容 | 相对体积 |
| :--- | :--- | :--- |
| 单阶段 | 源码 + 编译器 + 全部依赖 + 构建产物 | 基准 |
| 多阶段 | 构建产物 + 生产依赖 | 常见缩小到三分之一到十分之一 |

体积之外还有一个更实际的收益：运行阶段镜像里没有编译器、没有源码，应用被攻破后攻击者能用的工具少得多。

### 基础镜像怎么选

| 基础镜像 | 体积量级 | 有无 shell | 适用与注意 |
| :--- | :--- | :--- | :--- |
| `node:22` | 最大 | 有 | 需要编译原生模块时最省事 |
| `node:22-slim` | 中等 | 有 | 通用生产选择，性价比最好 |
| `node:22-alpine` | 小 | 有（busybox） | 注意 musl 与 glibc 差异 |
| `distroless/nodejs22` | 最小 | 无 | 安全优先，但无法 exec 进去排查 |

`alpine` 用 musl libc 而不是 glibc。预编译的原生模块（某些数据库驱动、图像处理库）在上面可能直接段错误，需要重新编译。遇到"本地好好的、容器里一启动就崩"，先怀疑这个。

`distroless` 值得单独权衡。它没有 shell，意味着出问题时无法 `docker exec` 进去看现场，也没有 `curl`、`netstat` 做连通性测试。选它的前提是已经有一套足够好的日志和指标，能不看现场就定位问题。

### 基础镜像要钉版本

`FROM node:22` 会在某个时间点悄悄换成新的补丁版本。对安全更新这是好事，对可复现构建是坏事：同一个提交在不同时间构建出的镜像内容不同，回滚时无法确定"上一次好的那个镜像"到底是什么。

```dockerfile
FROM node:22.19.0-slim
```

需要自动跟进安全更新时，交给依赖机器人开 PR，而不是靠浮动 tag 自动漂移。

## 四、`.dockerignore`：比多数人以为的重要

`COPY . .` 会拷贝构建上下文里的所有东西，除非被排除。后果有三层：

1. **构建变慢。** 上下文要整体传给构建器，本地那个几百 MB 的 `node_modules` 每次都传。
2. **缓存反复失效。** 本地跑过一次测试，日志文件变了，`COPY . .` 这层就失效。
3. **机密进入镜像。** `.env`、密钥文件、云凭据被拷进去，推送到仓库后就是泄露。

第三点需要强调一个机制：**镜像层是永久的。** 后面的层即使删掉了文件，它仍然留在之前那一层里，`docker history` 和 `docker save` 都能翻出来。所以"先 COPY 再 RUN rm"不是清除，只是让它在文件系统里看不见。

一个够用的起点：

```text
node_modules
dist
build
coverage

.git
.github
*.md

.env
.env.*
*.pem
*.key
*.p12

Dockerfile
docker-compose*.yml
.dockerignore

tests
**/*.test.ts
```

加一条 CI 检查会更稳妥，构建完扫一遍镜像层里有没有敏感文件名：

```bash
docker history --no-trunc <image> | grep -iE '\.env|\.pem|secret|token' && exit 1 || true
```

更好的做法是从根上避免：机密永远在运行时注入，不进镜像。

## 五、降权：默认 root 是必须处理的一项

容器里的 root 和宿主的 root 不是同一个（有命名空间隔离），但一旦容器逃逸，它就是宿主的 root。很多基础镜像默认以 root 运行，应用被攻破等于容器内是 root。

```dockerfile
FROM node:22-slim AS runtime
WORKDIR /app

# uid 用固定高位值，便于与宿主挂载卷的属主对齐
RUN groupadd -g 10001 app && useradd -u 10001 -g app -m app

COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/dist ./dist
COPY --from=build --chown=app:app /app/package.json ./

USER app

CMD ["node", "dist/server.js"]
```

三个细节值得单独说。

**`--chown` 要和 `USER` 配合。** 只写 `USER app` 而文件属主还是 root，应用可能连自己的目录都写不了。这个错误在启动阶段报 `EACCES`，看起来像配置问题，实际是构建期漏了 `--chown`。

**uid 不要用 1000 以下。** 宿主上容易被真实用户占用，挂载卷时出现"没权限"的怪问题。用 10001 这种高位值能避开绝大多数冲突。

**非 root 不能绑定 1024 以下的端口。** 容器里应该监听 8080 之类的高位端口，由外部映射到 80/443：

```bash
docker run -p 80:8080 <image>
```

### 运行时再加一层限制

镜像层面的降权之外，运行时还能收紧：

```yaml
services:
  api:
    image: <registry>/<image>:<tag>
    read_only: true              # 根文件系统只读
    tmpfs:
      - /tmp                     # 只给临时目录写权限
    security_opt:
      - no-new-privileges:true   # 禁止通过 setuid 提权
    cap_drop:
      - ALL
```

`read_only: true` 加 `tmpfs` 是一对好搭档。多数应用运行时只需要写临时目录，这样配置之后即使被攻破，攻击者也无法在容器里落地文件。

加 `read_only` 之后最常见的问题是应用往工作目录写缓存或日志。修法是把这些路径显式挂成 `tmpfs` 或命名卷，而不是关掉这个选项。

## 六、数据、网络与健康检查

容器可写层随容器删除而消失，所以需要保留的东西必须挂出来。

| 类型 | 写法 | 谁管理 | 用途 |
| :--- | :--- | :--- | :--- |
| 命名卷 | `uploads:/data` | Docker | 数据库文件、上传目录 |
| 绑定挂载 | `./src:/app/src` | 你 | 开发时热更新 |

绑定挂载在开发时很方便，但生产不要用它挂应用代码。那会破坏镜像的不可变性，"线上跑的是哪个版本"就说不清了，回滚也就失去意义。

Compose 会给同一个项目下的服务建一个默认网络，**服务名就是主机名**：

```yaml
services:
  api:
    environment:
      DATABASE_URL: postgres://app:secret@db:5432/app
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:17-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 3s
      retries: 10
      start_period: 30s
volumes:
  pgdata:
```

`depends_on` 这里有个必须注意的差别。只写 `depends_on: [db]` 时，Docker 只保证**启动顺序**，不保证数据库**已经能接受连接**。应用启动太快会报连接失败，而日志看起来像配置写错了。加上 `condition: service_healthy` 才是等真正可用。

`start_period` 也值得设。它表示这段时间内的失败不计入 `retries`，给应用留出启动时间。数据库首次初始化可能要几十秒，没有这个参数会一直判定不健康，编排层可能反复重启它。

## 七、资源限制与 OOMKilled

不设上限的容器会一直吃到宿主内存耗尽，然后内核的 OOM killer 挑一个进程杀掉，通常杀掉的是别的服务。

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
        reservations:
          memory: 256M
```

设了内存上限之后，容器超限会被内核杀掉，退出码是 **137**（128 + 9，即 SIGKILL）。这是排查时首先要认出的信号：

| 退出码 | 含义 | 常见原因 |
| :--- | :--- | :--- |
| 0 | 正常退出 | PID 1 正常结束 |
| 1 | 应用自身报错 | 配置错误、依赖缺失 |
| 137 | 被 SIGKILL | 内存超限，或被 `docker kill` |
| 143 | 收到 SIGTERM 后退出 | 正常优雅关闭 |

137 还要区分是哪种来源：

```bash
docker inspect <container> --format '{{.State.OOMKilled}}'
# true 说明是内存超限，false 说明是被手动 kill
```

如果是 OOM，还要看是堆内存超了还是堆外内存超了。Node 的默认堆上限与容器内存限制无关，容器给 512M 而 V8 可能按宿主内存计算默认值，结果进程以为还有很多余量，直到被内核杀掉。这类问题需要显式设 `--max-old-space-size` 到容器限制的 70% 左右：

```dockerfile
ENV NODE_OPTIONS="--max-old-space-size=358"
```

## 八、排障顺序

容器出问题时按这个顺序看，多数情况前三步就能定位：

```bash
# 1. 状态与退出码。先看退出码能砍掉一半可能性
docker ps -a

# 2. 日志。--tail 限制行数避免刷屏，-t 带时间戳便于和时间线对齐
docker logs --tail 200 -t <container>

# 3. 是否被 OOM 杀掉
docker inspect <container> --format '{{.State.OOMKilled}} {{.State.ExitCode}}'

# 4. 进容器看现场（distroless 镜像没有 shell，进不去）
docker exec -it <container> sh

# 5. 实时资源占用
docker stats <container>

# 6. 从容器内部测连通性，排查服务发现问题
docker exec -it <container> wget -qO- http://other-service:8080/health

# 7. 看每一层多大，找体积罪魁
docker history <image> --human --no-trunc

# 8. 磁盘占用与清理
docker system df
docker system prune -a
```

几个症状对应常见原因：

| 症状 | 大概率原因 |
| :--- | :--- |
| 启动后立刻退出 | PID 1 是后台进程，或 `CMD` 写成了 `RUN` |
| `docker stop` 每次等 10 秒 | PID 1 没处理 `SIGTERM`，缺 `exec` 或 init |
| 退出码 137 | 内存超限，用 `OOMKilled` 确认 |
| 启动即连不上数据库 | `depends_on` 没配 `condition: service_healthy` |
| 构建慢且缓存总失效 | `COPY . .` 在依赖安装之前，或缺 `.dockerignore` |
| 挂了卷报没有权限 | 容器内 uid 与宿主文件属主不匹配 |
| 容器内时间差 8 小时 | 基础镜像缺时区数据，`TZ` 未生效 |

最后一条容易忽略。`alpine` 和 `slim` 镜像默认不带完整的时区数据库，`TZ=Asia/Shanghai` 可能不生效，应用写出的时间戳会差 8 小时：

```dockerfile
RUN apk add --no-cache tzdata
ENV TZ=Asia/Shanghai
```

更稳的做法是应用内部统一用 UTC 存储和计算，只在展示层做时区转换。容器时区不对只是症状，根源常常是应用对时区的假设不明确。

## 九、上线前逐项核对

**镜像**

- [ ] 基础镜像钉到具体补丁版本，不用浮动 tag
- [ ] 多阶段构建，运行阶段只带运行时产物
- [ ] 显式 `USER` 降权，`--chown` 与之一致，uid 用高位值
- [ ] `.dockerignore` 排除 `.env`、密钥、`node_modules`、测试
- [ ] 机密只在运行时注入，构建后用 `docker history` 扫一遍确认
- [ ] 需要时区和 locale 的镜像显式安装并设置

**运行**

- [ ] `CMD` 用 exec 形式，应用是 PID 1，正确处理 `SIGTERM`
- [ ] 配了健康检查，编排依赖用 `service_healthy` 而非仅 `depends_on`
- [ ] 需要持久化的数据一律挂卷，不放容器可写层
- [ ] 设了内存与 CPU 上限，并验证过超限时的表现
- [ ] 生产环境加 `read_only`、`no-new-privileges`、`cap_drop: [ALL]`

**流程**

- [ ] 镜像 tag 带版本或提交哈希，部署不用 `latest`
- [ ] CI 里启用了构建缓存导出，第二次构建显著快于第一次
- [ ] 单容器单职责。数据库、队列、定时任务、Web 不要塞进同一个容器
- [ ] 日志打到 stdout/stderr 由外部收集，不在容器内做轮转
- [ ] 回滚路径明确：镜像 tag 可回退，且数据库迁移与代码回滚的关系已想清楚

## 十、容器化的边界

容器解决的是"运行环境一致性"。它不解决配置管理、密钥分发、服务发现、数据持久化和可观测性。这五件事在容器化之后仍然需要单独设计，只是实现方式从"在服务器上装东西"变成了声明式配置加外部服务。

所以把应用放进容器只是完成了第一步。上面清单里的每一条都对应过真实故障：容器起来就退出、停止要等 10 秒、内存超限被杀、挂了卷没权限、改了代码没生效、时间差 8 小时。它们都不是 Docker 的缺陷，而是容器模型本身的推论。一旦接受了"容器是一个进程、镜像是只读层、可写层是临时的"这三条，这些现象就都是可以提前规避的。
