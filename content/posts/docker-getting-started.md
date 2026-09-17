---
title: "Docker 入门：从写第一个 Dockerfile 到跑起来"
description: "面向刚接触容器的人：镜像和容器到底是什么关系，Dockerfile 每一行在做什么，构建与运行的完整流程，以及第一次一定会踩的几个坑。"
date: "2026-09-16"
tags: ["Engineering", "Docker"]
category: "Engineering"
cover: "/posts/docker-layers.webp"
hideCover: true
---

如果你刚开始接触 Docker，大概会遇到这样的局面：教程里一堆命令，`docker run` 后面跟着五六个参数，每篇文章都假设你已经懂了上一篇文章的内容。

这篇想换个顺序。先讲清楚"它到底解决了什么问题"，再从一个能跑起来的 Dockerfile 开始，把手感建立起来，最后再说生产环境要多加哪些东西。

## 一、它到底解决什么问题

先说一个你大概率经历过的场景。

你写了一个 Node 项目，本地跑得好好的。发给同事，他装完依赖，报错：某个包编译不过。你去看，是他机器上的 Node 版本比你低。你让他升级，升完又报另一个错，因为系统里缺一个 C 库。好不容易跑起来，部署到服务器上又崩了，因为服务器的系统版本和你们的电脑都不一样。

问题的根源是：**你交付的是源代码，但代码要跑起来还需要一整套环境。** 依赖包的版本、Node 的版本、系统的 C 库、时区文件、环境变量，缺一样都可能出问题。

Docker 做的事情，就是把"代码 + 它需要的整套环境"一起打包成一个文件。这个包在哪台机器上跑，里面的环境就是一样的。从根本上消除了"在我机器上是好的"这句话。

对了，"容器"这个词容易让人以为它是一个小型的虚拟机。不是的，后面第四点会讲清这个区别，因为它直接关系到你会遇到的一类错误。

![容器分层的叠加关系](/posts/docker-layers.webp "803x1043")

## 二、两个必须分清的词

学 Docker 最先要搞清的是**镜像（image）** 和**容器（container）** 的关系。

| | 镜像 image | 容器 container |
| --- | --- | --- |
| 是什么 | 一个只读的模板，包含代码和运行环境 | 镜像跑起来之后的一个运行实例 |
| 类比 | 安装包 / 光盘 | 装好并正在运行的程序 |
| 数量关系 | 一个镜像可以启动很多个容器 | 一个容器来自某一个镜像 |
| 能不能改 | 构建出来就是只读的 | 运行时可以往里写文件，但删掉容器就没了 |

用一句话记：

> **镜像是"做了什么"，容器是"正在跑什么"。**

这两个词在教程里经常混用，读的时候要留意。看到 `docker build` 就是在做镜像，看到 `docker run` 就是在起容器。

还有一个命令你会一直用到，它把本地代码变成镜像：

```bash
docker build -t my-app .
```

`-t my-app` 是给这个镜像起个名字，`.` 是告诉 Docker"在当前目录找 Dockerfile"。这行看起来简单，但结尾那个点经常被漏掉，漏了会报 `requires exactly 1 argument`。

## 三、第一个能跑的 Dockerfile

新建一个文件，名字就叫 `Dockerfile`（没有扩展名，D 大写），内容如下。这是一个最小的 Node 服务：

```dockerfile
# 1. 从哪个基础镜像开始
FROM node:22-slim

# 2. 容器里的工作目录，后面的命令都在这里执行
WORKDIR /app

# 3. 把依赖清单拷进去
COPY package.json package-lock.json ./

# 4. 安装依赖
RUN npm ci --omit=dev

# 5. 把剩下的代码拷进去
COPY . .

# 6. 声明这个容器会监听哪个端口（只是声明，方便阅读）
EXPOSE 3000

# 7. 容器启动时跑什么
CMD ["node", "server.js"]
```

七行，但每行都有它的理由。几个新手最容易困惑的地方：

**为什么要先 COPY 依赖清单，再 COPY 代码？** 因为 Docker 会缓存每一步的结果。如果先拷全部代码，你改一个字，第 4 步的依赖安装就得重来一遍，因为前面的输入变了。分两步写的话，只要 `package.json` 没变，依赖那一步就一直用缓存。一个项目依赖装一次要一分钟，这个顺序能帮你省下大量等待时间。

**`COPY . .` 里两个点是什么意思？** 前面一个是宿主机上的路径（当前目录），后面一个是容器里的路径。因为第 2 行设了 `WORKDIR /app`，所以第二个点展开是 `/app`。

**`RUN` 和 `CMD` 有什么区别？** 这是新手最容易搞混的一对：

| | `RUN` | `CMD` |
| --- | --- | --- |
| 什么时候执行 | **构建镜像时**，执行结果会被固化进镜像 | **容器启动时** |
| 能写几条 | 可以写很多条 | 只生效最后一条 |
| 典型用途 | 装依赖、编译代码、建目录 | 启动服务 |

一个常见的错误是把启动命令写成了 `RUN`：

```dockerfile
# 错误：构建时跑了一次，然后就没有然后了，容器启动后立刻退出
RUN node server.js
```

## 四、为什么容器起来就退出了

这是新手遇到的第一个"莫名其妙"的问题：`docker build` 成功，`docker run` 之后 `docker ps` 里什么都看不到。

原因是：**容器的一生由里面的主进程决定。主进程结束，容器就结束。**

而容器的"主进程"是固定的，就是镜像里最后那条 `CMD`。

所以只要 `CMD` 指向的东西"很快就干完并退出了"，容器就会立刻退出。三种最常见的情况：

```dockerfile
# 情况一：CMD 写成了 RUN，运行期根本没有主进程
RUN node server.js

# 情况二：启动了后台服务，命令自己返回了
CMD service nginx start

# 情况三：命令跑完就结束了，比如只是想打印点什么
CMD echo "started"
```

正确的写法是让主进程**留在前台一直运行**：

```dockerfile
CMD ["node", "server.js"]
```

这里的方括号写法叫 exec form，它是把 `node` 直接作为进程启动。另一种写法 `CMD node server.js` 是 shell form，它会先生成一个 shell，再由 shell 启动 node。两者差别在第七点会讲，现在只需记住：**用方括号那一种。**

顺便记住容器不是虚拟机的三个直接推论：

1. 容器里没有自己的内核，共用宿主机的。所以 Linux 上跑不了 Windows 容器。
2. 容器里必须有一个前台进程。没有，容器就结束。
3. 容器一删，它运行期间写入的文件全部消失。需要保留的东西要挂出来，见第六点。

### 排查这一类的固定动作

```bash
# 1. 看所有容器，包括已经退出的
docker ps -a

# 2. 看它退出前的输出，错误信息通常在这里
docker logs <容器ID>

# 3. 看退出码。0 正常结束，1 是代码报错，137 是被强杀
docker inspect <容器ID> --format '{{.State.ExitCode}}'
```

只要养成"先看 `docker ps -a` 和 `docker logs`"的习惯，这类问题大部分能自己解决。

## 五、构建和运行的完整流程

上面那个 Dockerfile 存好之后，完整的操作是这样：

```bash
# 1. 构建镜像。结尾的点不能漏
docker build -t my-app .

# 2. 起一个容器，把容器的 3000 端口映射到本机的 3000
docker run -d -p 3000:3000 --name my-app-running my-app

# 3. 看它跑起来没有
docker ps

# 4. 看日志
docker logs -f my-app-running

# 5. 进容器里看看（里面是个精简的 Linux）
docker exec -it my-app-running sh

# 6. 停掉并删除
docker stop my-app-running
docker rm my-app-running
```

`-p 3000:3000` 这个参数值得单独说，因为它容易记反。格式是：

```
-p <本机端口>:<容器端口>
```

冒号左边是你浏览器要访问的端口，右边是容器里应用实际监听的端口。如果应用监听 8080，你想用自己的 80 端口访问，就写 `-p 80:8080`。

`-d` 表示后台运行（detached），不加的话日志会直接刷在终端里，`Ctrl+C` 就把容器停掉了 —— 调试的时候不加 `-d` 反而更方便。

### 关于镜像体积

`node:22-slim` 这个基础镜像大约 200 MB，加上依赖，最后可能到 300–400 MB。对新手来说这完全够用。

有一个认知值得现在建立：**镜像里不需要的东西，都会一直跟着它。** 编译器、测试框架、构建工具的缓存，如果不清理，会全部留在镜像里，镜像可能因此膨胀到 1 GB 以上。第八点会讲怎么把它们去掉，现在不用操心。

如果用的是 `node:22-alpine` 而不是 `-slim`，镜像能小不少，但要注意 alpine 用的是 musl 而不是 glibc，某些需要编译的原生模块在上面可能会报错。**新手先用 `-slim`，遇到问题少一半。**

## 六、数据不能放在容器里

容器的可写层是临时的。你把文件写进容器，容器一删就没了。这意味着数据库、上传的图片、日志这些需要留下来的东西，都不能放在容器内部。

解法是"挂载"——把宿主机的目录接到容器里：

```bash
docker run -d \
  -p 8080:8080 \
  -v my-data:/var/lib/app/data \
  my-app
```

`-v my-data:/var/lib/app/data` 的意思是：创建一个叫 `my-data` 的存储卷，挂到容器的这个目录下。之后的读写都落到卷上，容器删了卷还在。

两种挂载要分清，混用会出问题：

| 写法 | 名字 | 谁管理 | 什么时候用 |
| --- | --- | --- | --- |
| `-v my-data:/data` | 命名卷 | Docker 管 | 数据库文件、上传目录 |
| `-v ./src:/app/src` | 绑定挂载 | 你自己管 | **开发时**改代码立即生效 |

绑定挂载在开发时很有用，改代码不用重新构建。但**生产环境不要用它挂应用代码**，那样"线上跑的是哪个版本"就说不清了，回滚也变得没有意义。

## 七、两个会让容器"不听话"的细节

### 1. 停止容器每次都要等 10 秒

如果你发现 `docker stop` 之后总要卡十秒钟，而且应用里的优雅关闭逻辑从来没执行过，那多半是信号没传到。

原因有点绕但值得知道：Linux 对 1 号进程（PID 1）有个特殊规则 —— **没有显式注册处理函数的信号，默认被忽略。** 而 `docker stop` 是先发 `SIGTERM` 让应用自己收尾，等 10 秒还不退才强杀。

如果你的 PID 1 是个不处理信号的程序（比如用 shell form 启动时的那个 shell），`SIGTERM` 就被丢掉了，只能等满 10 秒挨一刀。

三条修法，从好到差：

```dockerfile
# 首选：exec form，应用直接成为 PID 1
CMD ["node", "server.js"]

# 需要 shell 展开环境变量时，加 exec 把进程顶上去
CMD ["sh", "-c", "exec node server.js"]

# 或者引入一个小 init 进程专门转发信号
ENTRYPOINT ["tini", "--"]
CMD ["node", "server.js"]
```

`exec` 的作用是用目标进程**替换**掉当前 shell，而不是新建一个子进程。少了它，PID 1 是 shell，应用只是它的孩子，信号传不到孩子那里。

### 2. 容器里的时间差 8 小时

`slim` 和 `alpine` 这类精简镜像通常不带完整的时区数据，所以 `TZ=Asia/Shanghai` 可能不生效，应用写出的时间戳会差八小时。

```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends tzdata \
    && rm -rf /var/lib/apt/lists/*
ENV TZ=Asia/Shanghai
```

不过更根本的办法是：**应用内部统一用 UTC 存和算，只在界面上转换成当地时间。** 容器时区不对只是症状，真正的问题是应用对时区的假设不明确。

## 八、进阶：把镜像做小、做安全

前面那个 Dockerfile 能用，但有两个可以改进的地方：编译器跟着镜像走，以及应用以 root 身份运行。

### 用多阶段构建去掉构建工具

思路是分成两个阶段：第一个阶段装全部依赖并编译，第二个阶段只拿走编译结果。

```dockerfile
# ---------- 阶段一：构建 ----------
FROM node:22-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci                     # 这里包含开发依赖，编译要用

COPY . .
RUN npm run build              # 编译成 dist/

# 只装生产依赖，放到一个干净目录，下一步只拷这个
RUN npm ci --omit=dev --ignore-scripts

# ---------- 阶段二：运行 ----------
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

关键在 `COPY --from=build` 这一句 —— 它只从第一个阶段拿指定的文件，编译器、源码、开发依赖全都不会进最终镜像。体积通常能降到原来的三分之一甚至更少。

除了小，还有一个不太直观但很重要的收益：运行阶段的镜像里没有编译器和源码，万一应用被攻破，攻击者手里可用的工具也少得多。

### 别用 root 跑应用

很多基础镜像默认以 root 运行。容器里的 root 和宿主机的 root 不是一回事，但一旦容器被突破，它就是宿主机的 root。

```dockerfile
FROM node:22-slim AS runtime
WORKDIR /app

# 建一个普通用户。uid 用高位值，避免和宿主机上的真实用户撞号
RUN groupadd -g 10001 app && useradd -u 10001 -g app -m app

# --chown 要和 USER 配合，否则文件属主还是 root，应用可能连自己的目录都写不了
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/dist ./dist

USER app

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

两点容易踩：

- **`--chown` 漏了会报 `EACCES`。** 只写 `USER app` 但文件还是 root 的，应用写不了目录，错误看起来像权限配置问题。
- **普通用户不能绑定 1024 以下的端口。** 所以容器里监听 8080，再用 `-p 80:8080` 映射出去。

### 一个容易忽略的文件：.dockerignore

`COPY . .` 会拷贝当前目录下的所有东西，包括你不想带进去的。新建一个 `.dockerignore`：

```text
node_modules
dist
.git
.env
.env.*
*.pem
*.key
*.md
Dockerfile
docker-compose*.yml
```

不写这个文件会有三个后果：构建变慢（本地那个几百 MB 的 `node_modules` 白拷一遍）、缓存反复失效、以及**密钥被打进镜像**。

最后一条要特别留意：**镜像的层是永久的。** 就算你后面用 `RUN rm` 删掉了文件，它仍然留在之前那一层里，用 `docker history` 能翻出来。所以密钥文件不要先拷进去再删，正确做法是根本不拷——运行时通过环境变量传进去。

## 九、写 Dockerfile 的顺序原则

最后把前面零散提到的规则收成一张清单。写 Dockerfile 时按这个顺序想：

1. **选基础镜像**，钉到具体版本（`node:22.19.0-slim`），不要用 `latest`
2. **先拷依赖清单，再装依赖，最后拷代码** —— 这一条决定了构建快慢
3. **需要保留的数据挂卷**，不放容器可写层
4. **`.dockerignore` 排除 `.env` 和密钥** —— 镜像层永久，拷进去就清不掉
5. **`CMD` 用 exec form**（方括号），让应用成为 PID 1
6. **显式 `USER` 降权**，同时记得 `--chown`
7. **用多阶段构建**把编译器和源码留在构建阶段
8. **镜像打版本号标签**，部署时不用 `latest`

八条都不难，但每一条对应过真实的坑：构建慢、容器退出、数据丢失、密钥泄露、停止要等 10 秒、权限报错、镜像几百兆、回滚时不知道线上是哪个版本。

## 十、接下来练什么

看完之后建议动手做一遍，比继续读有用：

```bash
# 找一个小项目，写 Dockerfile，然后依次试这些
docker build -t my-app .
docker run -d -p 3000:3000 --name demo my-app
docker logs -f demo
docker exec -it demo sh
docker stop demo

# 看看镜像每一层多大，找出体积是从哪来的
docker history my-app

# 磁盘满了再回来执行这个（会清理未使用的镜像和缓存）
docker system df
docker system prune -a
```

练的时候可以故意犯几个错，看看报什么：把 `CMD` 删掉、把 `-p` 写反、忘了 `.dockerignore`。亲手见过一次错误信息，下次遇到就能立刻认出来。

再往后可以考虑的：用 Docker Compose 同时管理应用和数据库（不用手工记端口和网段），在 CI 里做构建缓存（让流水线里的第二次构建快起来），以及设置内存上限（避免一个容器把整台机器吃满）。这三个方向都写在另一篇里，等这个流程熟练了再看。
