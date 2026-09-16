---
title: "把 JWT 校验做成生产级：中间件、密钥轮换与失效策略"
description: "一份可以直接落地的 JWT 校验实现，附错误码分层、密钥轮换、多服务公钥缓存、失效策略取舍与安全回归测试。"
date: "2026-09-16"
tags: ["Engineering", "JWT"]
category: "Engineering"
cover: "/posts/jwt-token-anatomy.webp"
coverPosition: "center 24%"
featured: true
---

接手过一个鉴权中间件，核心就三行：

```js
const payload = jwt.decode(token);
req.user = { id: payload.sub, role: payload.role };
next();
```

它上线很久没出事，因为没人想过去改 token。后来有人把 `role` 从 `user` 改成 `admin`，重新拼了个字符串发过去，后台就开了。整个过程不需要密钥，不需要会写代码，浏览器控制台里改一行就行。

问题不在于这三行写得潦草，而在于 `jwt.decode` 这个方法名太像"验证"了。这类缺陷在代码评审里很难被发现，因为它看起来就是标准写法。

下面是从一个真实中间件整理出来的实现，以及围绕它必须配套的那些东西：错误码怎么分层、密钥怎么轮换、多服务怎么拿公钥、token 怎么失效、怎么防止改回去。

![JWT 三段结构中签名覆盖的范围](/posts/jwt-token-anatomy.webp "1600x1128")

## 一、先解决一个编码细节，它会以"部分用户登录失败"的形式出现

JWT 用 base64url，不是标准 base64。`+` 换成 `-`，`/` 换成 `_`，末尾 `=` 填充全部去掉。理由是 JWT 要塞进 URL、HTTP 头和 cookie 值，而 `+` 在查询串里会被解析成空格，`=` 在 cookie 值里有歧义。

这个细节会在两个地方咬人。

**第一处是解码。** 标准 base64 解码器要求长度是 4 的倍数，base64url 丢掉 `=` 之后经常不是，`Buffer.from(str, "base64")` 会静默截断：

```js
function fromBase64url(value) {
  // 去掉的填充要补回来，否则长度不是 4 的倍数时解码结果是错的
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  return Buffer.from(pad ? normalized + "=".repeat(4 - pad) : normalized, "base64");
}
```

**第二处是前端。** `atob()` 不认 base64url，遇到含 `-` 或 `_` 的 token 会抛 `InvalidCharacterError`。这个报错只在部分 token 上出现，在监控里表现为"登录成功率 97%"，排查方向很容易跑偏到网络或账号数据上。

有一个立刻能用的上线检查：**统计一次 token 里是否出现过 `-` 和 `_`**。如果签名段一直在用标准 base64 的字符集，说明签发端和解码端对格式的理解不一致，早晚会在数据量上来之后暴露。

## 二、校验中间件：每一步都要有理由

下面这份实现只依赖 Node 内置的 `crypto`。用成熟的 JWT 库当然更省事，但你应该能对照着说清每一步在挡什么，否则出问题时只能靠猜。

```js
import { createHmac, timingSafeEqual } from "node:crypto";

const ALLOWED_ALG = "HS256";
const CLOCK_TOLERANCE_SECONDS = 30;

class AuthError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

function verifySignature(token, keys) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new AuthError("MALFORMED_TOKEN");
  const [headerPart, payloadPart, signaturePart] = parts;

  // ① 算法由服务端决定。绝不从 token 里读 alg 再据此选择验证方式。
  let header;
  try {
    header = JSON.parse(fromBase64url(headerPart).toString("utf8"));
  } catch {
    throw new AuthError("MALFORMED_TOKEN");
  }
  if (header.alg !== ALLOWED_ALG) throw new AuthError("ALG_NOT_ALLOWED");

  const actual = fromBase64url(signaturePart);

  // ② 密钥可能存在多个（轮换期），逐个尝试。
  //    注意签名的计算对象是收到的原始 headerPart.payloadPart 字符串，
  //    不能重新序列化 JSON，否则字节可能不一致。
  const signingInput = `${headerPart}.${payloadPart}`;
  const matched = keys.some(({ secret }) => {
    const expected = createHmac("sha256", secret).update(signingInput).digest();
    // ③ timingSafeEqual 对长度不等会抛异常，先判长度把它变成明确的鉴权失败，
    //    否则攻击者用一个超长签名就能把 401 变成 500，日志里全是服务器错误
    if (expected.length !== actual.length) return false;
    // ④ 定长时间比较，避免比较耗时泄露"前多少字节正确"
    return timingSafeEqual(expected, actual);
  });

  if (!matched) throw new AuthError("BAD_SIGNATURE");

  // ⑤ 签名通过之后才解析载荷
  let claims;
  try {
    claims = JSON.parse(fromBase64url(payloadPart).toString("utf8"));
  } catch {
    throw new AuthError("MALFORMED_TOKEN");
  }
  return { claims, kid: header.kid ?? null };
}
```

### 为什么算法白名单不是教条

把 `alg` 交给 token 自己声明，会同时打开两个洞。

第一个是 `alg: none`，早期几个库真的会接受签名为空的 token。

第二个更隐蔽，值得展开。假设服务端用 RS256 签发，公钥发布在 `/.well-known/jwks.json`，而校验代码写成这样：

```js
// 有漏洞的写法
const decoded = jwt.decode(token, { complete: true });
jwt.verify(token, getKeyFor(decoded.header.alg), {
  algorithms: [decoded.header.alg],   // 从 token 里读算法
});
```

攻击者从 JWKS 端点拿到公钥（公开信息），构造 `{"alg":"HS256"}` 的头，然后**用公钥的文本内容当 HMAC 密钥**对 `header.payload` 算签名。服务端读到 `alg: HS256`，就用 HMAC 校验，而它取的"HS256 对应的密钥"就是那把公钥。签名自然对得上。

这个攻击不需要任何秘密。防御也就一句话：先断言算法，再用固定算法校验。

```js
if (header.alg !== "RS256") throw new AuthError("ALG_NOT_ALLOWED");
jwt.verify(token, publicKey, { algorithms: ["RS256"] });
```

`algorithms` 是硬性白名单，永远显式传，不要从 token 推导。

### 时钟容忍度：真实的作用和代价

上面有 `CLOCK_TOLERANCE_SECONDS = 30`。它常被解释为"防止时钟偏差导致误拒"，但实际影响比这个说法小得多。

少数派慢 30 秒的服务，会把一个刚过期的 token 判定为仍有 30 秒有效期。也就是说容忍度**宽的是攻击窗口，不是保护**。它换来的是避免边界上零星的误拒，代价明确。

所以取值方式应该是：如果签发方和校验方在同一批机器上、有 NTP 同步，这个值可以设得比较小，10 到 30 秒足够；如果校验方是外部不可控的客户端或第三方服务，才需要考虑放宽。**不要写 300 秒**，那等于给每个 token 加了 5 分钟白送的有效期。

## 三、错误码分层：401 和 403 混用会让前端没法处理

中间件抛出的错误码不应该直接透给客户端，但也不应该全部压成一个 401。分层方式取决于客户端的处理能力。

| 内部错误码 | HTTP | 客户端应该做什么 |
| :--- | :--- | :--- |
| `MALFORMED_TOKEN` | 400 | 清掉本地 token，跳登录页 |
| `ALG_NOT_ALLOWED` | 401 | 同上，并记一条安全事件 |
| `BAD_SIGNATURE` | 401 | 同上，并记一条安全事件 |
| `EXPIRED` | 401 | 尝一次静默刷新，失败再跳登录 |
| `NOT_YET_VALID` | 401 | 稍后重试，通常是时钟问题 |
| `TOKEN_REVOKED` | 401 | 直接跳登录，不要重试刷新 |
| `PERMISSION_DENIED` | 403 | 留在原页，提示无权限 |

两个关键区分：

**`EXPIRED` 和 `TOKEN_REVOKED` 必须分开。** 前者可以尝试刷新，后者刷新也没用（要么是被吊销的 token 链，要么用户已被封禁）。两者都返回 401 而不带可区分的 code，客户端只能要么全部重试刷新（被吊销时会造成刷新风暴），要么全部跳登录（过期时把用户的编辑内容丢掉）。

**`BAD_SIGNATURE` 和 `ALG_NOT_ALLOWED` 要记安全事件。** 正常客户端不会产生这两种错误。它们的出现频率应该接近零，一旦有量就是有人在试探，应该接告警而不是只写进访问日志。

## 四、密钥轮换：最容易在上线时才想起的事

密钥不能只写在环境变量里然后永远不动。轮换时有个刚性约束：**旧 token 在过期前必须仍然能验证通过**，否则轮换的一瞬间所有在线用户被登出。

所以验证端必须支持多个密钥，靠 `kid` 区分：

```js
// 密钥来源是列表而不是单个值。新密钥用于签发，列表里的旧密钥只用于验证。
async function loadKeys() {
  return [
    { kid: "2026-09", secret: env.JWT_SECRET_CURRENT },
    { kid: "2026-06", secret: env.JWT_SECRET_PREVIOUS },
  ].filter((entry) => Boolean(entry.secret));
}

function sign(claims, key) {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT", kid: key.kid }));
  const payload = b64url(JSON.stringify(claims));
  const data = `${header}.${payload}`;
  return `${data}.${b64url(createHmac("sha256", key.secret).update(data).digest())}`;
}
```

轮换的操作顺序不能反：

```
1. 加新密钥。签发切到新 kid，验证端同时接受新旧两把钥匙
2. 观察一个完整的 access token 生命周期（例如 15 分钟）加一点余量
   —— 此时可以确认已没有任何用旧密钥签发的 token 在流通
3. 从验证端移除旧密钥
```

如果顺序反了，先删旧密钥再上线新密钥，那中间的窗口里所有存量 token 全部变成 `BAD_SIGNATURE`，用户被集体登出，而且日志里看起来像一次攻击。

`kid` 还带来一个运维上的好处：**它能让你从日志里看出当前有多少比例的请求还在用旧密钥**。第 2 步的等待时间就可以用数据判断，而不是靠猜。

### 密钥本身的长度和来源

HS256 的密钥必须是随机值，不是口令，也不要用"用户密码 + 盐"那类可推导的东西。它的安全性直接取决于熵。32 字节随机值（64 位十六进制）是常见做法。生成方式：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

多服务场景下，如果只想让某些服务**校验**而不想给它们**签发**能力，就必须用非对称算法。HS256 的性质是共享密钥即可签发，你把密钥发给一个只读服务，它就能伪造任意用户。

## 五、多服务验证：JWKS 缓存和它带来的延迟

用 RS256/ES256 时，校验方需要公钥。公钥以 JWKS 形式发布，校验方缓存它。这一层缓存有几个必须处理的边界：

**缓存必须带过期时间。** 密钥轮换后，如果校验方一直用旧公钥，新签发的 token 会验不过。常见设置是缓存 5 到 15 分钟，同时保留旧公钥一小段时间。

**遇到未知 `kid` 要强制刷新一次。** 这是最容易被漏掉的分支。轮换刚发生时，请求带着新 `kid` 到达，而校验方的缓存里只有旧公钥。如果不处理，就会对每个请求都判一次失败，直到缓存自然过期。正确做法是：`kid` 不在缓存里时立刻拉一次 JWKS，仍然找不到才判定失败。

```js
async function getVerificationKey(kid) {
  let keys = cache.get();
  if (!keys || Date.now() > cache.expiresAt || !keys.has(kid)) {
    // 未知 kid 或缓存过期都触发一次拉取。
    // 需要并发合并，否则轮换瞬间所有实例同时打 JWKS 端点
    keys = await fetchJwksWithSingleFlight();
    cache.set(keys, Date.now() + 10 * 60_000);
  }
  const key = keys.get(kid);
  if (!key) throw new AuthError("UNKNOWN_KEY_ID");
  return key;
}
```

**JWKS 拉取要做并发合并。** 上面注释里提到的 single flight 很重要：多实例同时启动、或者轮换瞬间，如果每个请求都去拉 JWKS，签发方的端点会被自己人打满。用一把进程内的锁把并发的拉取合成一次即可。

**JWKS 不可用时的降级策略要先定。** 签发方挂掉时，校验方是拒绝所有请求（安全，但全站不可用），还是用过期缓存继续服务一段时间（可用，但期间无法感知密钥轮换）？这个决定必须在架构阶段做，不能等故障时临场决定。多数业务系统选后者，配合告警。

## 六、失效策略：三种方案的运维成本

JWT 无法即时失效这件事，是选型时最该算清楚的一笔账。

| 方案 | 注销生效延迟 | 每请求开销 | 运维复杂度 | 适合的场景 |
| :--- | :--- | :--- | :--- | :--- |
| 短有效期 + 刷新令牌 | 等于 access token 有效期 | 无 | 需要实现刷新流程 | 大多数业务系统 |
| 令牌版本号 | 等于缓存 TTL | 一次用户查询（可缓存） | 需要一列字段和一次比对 | 有改密码、封禁、强制下线需求 |
| 黑名单 | 等于存储读取延迟 | 一次键值查询 | 需要一个带 TTL 的存储 | 高风险操作后需要精确吊销 |
| 前端删除 token | 不生效 | 无 | 无 | 不是方案 |

令牌版本号方案在实践中最划算，因为它一次覆盖多个需求：

```js
// 签名校验通过之后
const user = await getUserCached(claims.sub);
if (!user) throw new AuthError("USER_NOT_FOUND");
if (claims.ver !== user.tokenVersion) throw new AuthError("TOKEN_REVOKED");
```

`tokenVersion` 是一个整数列，在四种情况下自增：用户改密码、管理员封禁、权限被降级、用户主动"登出所有设备"。改密码时自增这一个动作，就满足了"改完密码所有设备下线"的预期。

它的代价是每次请求多一次查询，所以**这个查询必须有缓存**，否则等于把无状态设计的收益全部还回去。缓存 30 到 60 秒是常见取值，此时注销生效延迟就等于这个 TTL。这个数字要写进文档，因为它是一个安全属性，不是一个性能参数。

黑名单方案的适用面比想象中窄。它要求每次请求都查一次存储，而且要为每个条目设置与 token 剩余有效期等长的 TTL。只有在"必须精确知道某个 token 已失效"的场景才值得，例如检测到异常登录后的强制下线。

## 七、refresh token 轮换：宽限窗口是为了不伤到正常用户

access token 短命，就需要 refresh token 来换新的。它的权限更大，因为它能无限次换取 access。

轮换机制是每次刷新时旧的立即作废：

```
客户端持有 R1
  └─ 请求刷新 ─→ 签发 AT2 + R2，R1 标记为已使用
                 客户端丢弃 R1，保存 R2

如果之后又收到 R1
  └─ 合法客户端不会重复用旧的 → 说明它被复制过
     → 吊销整条令牌链，要求重新登录
```

这套机制的真正价值在最后那一步：它把"refresh token 泄露"从一个不可观测的事件变成可观测的事件。

直接实现会撞上一个问题：**客户端因为网络超时重试，会把同一个 refresh token 发两次。** 移动网络下这个概率不低。严格按"已使用即拒绝"处理，结果是用户被随机踢下线，而且极难复现——只在网络抖动时出现，本地和测试环境都看不出来。

处理方式是给已轮换的 token 一个短宽限窗口：

```js
const record = await store.get(hash(token));
if (!record) throw new AuthError("REFRESH_TOKEN_INVALID");

if (record.rotatedAt) {
  // 宽限期内重复使用，视为客户端重试，返回同一个后继 token
  if (Date.now() - record.rotatedAt < 10_000 && record.successor) {
    return record.successor;
  }
  // 超出宽限期，按泄露处理
  await store.revokeChain(record.chainId);
  throw new AuthError("REFRESH_TOKEN_REUSED");
}
```

窗口长度要按客户端超时设置来定。客户端超时是 5 秒，窗口给 10 秒就够；如果客户端会重试三次，窗口要覆盖完整的重试跨度。这个参数不能凭感觉填，应该按客户端的重试策略算出来。

还有一点必须明确：**refresh token 要有服务端记录。** 它是整个体系里唯一有状态的部分，也正是它让吊销成为可能。只靠签名自证的 refresh token 等于一个有效期很长的 access token，泄露后无法处理。

## 八、存储位置：按"页面里有没有第三方脚本"来判断

"不要把 token 放 localStorage"这句话容易被理解成 localStorage 这个 API 不安全。实际上问题在于 localStorage 的内容可以被页面里任何一段脚本读取，而 XSS 的本质就是别人的脚本在你的页面里运行。

所以判断标准不是"localStorage 安全吗"，而是**你的页面里有没有可能出现第三方脚本**：

- CDN 上的分析、客服、A/B 测试脚本
- 第三方评论组件、广告 SDK
- 依赖链里某个包被投毒

只要有其中一个，localStorage 就在暴露面上。

| 存法 | XSS 能否读走 | CSRF 风险 | 备注 |
| :--- | :--- | :--- | :--- |
| `localStorage` | 能 | 无 | 最省事，风险最高 |
| `sessionStorage` | 能 | 无 | 同上，仅关闭标签页后失效 |
| `HttpOnly` cookie | 不能 | 有，靠 `SameSite` 缓解 | 推荐，但要配齐属性 |
| JS 内存变量 | 不能 | 无 | 刷新即丢失，必须配刷新机制 |

用 cookie 时三个属性缺一不可：

```js
res.cookie("access_token", token, {
  httpOnly: true,   // 脚本读不到
  secure: true,     // 只在 HTTPS 上发送
  sameSite: "lax",  // 跨站请求不带上
  path: "/",
  maxAge: 900_000,  // 与 token 的 exp 保持一致，避免两边不一致
});
```

`SameSite` 的取舍要说清楚。`strict` 最安全，但用户从外部链接点进站点时浏览器不会带 cookie，表现为"从搜索引擎点进来是未登录状态，刷新一下才正常"。这个行为在真实流量里一定会被用户投诉。`lax` 允许顶层导航携带 cookie，同时挡掉跨站表单提交和 XHR，多数站点选这个。

`maxAge` 和 `exp` 不一致是另一个常见问题。cookie 活得比 token 长，会表现为"cookie 还在但请求全是 401"，客户端不知道该刷新还是该跳登录。让它们由同一个数值推导出来，能省掉一类难查的投诉。

## 九、必须有的回归测试

上面每一条都能被一次"顺手简化"抹掉，所以要有测试钉住。这类测试的重点不是覆盖率，而是**把安全属性写成可执行的断言**：

```js
import { describe, expect, it } from "vitest";

describe("token 校验的安全属性", () => {
  it("拒绝 alg: none", () => {
    // 手工构造一个无签名的 token
    const header = b64url(JSON.stringify({ alg: "none", typ: "JWT" }));
    const payload = b64url(JSON.stringify({ sub: "u1", exp: future() }));
    expect(() => verify(`${header}.${payload}.`, keys)).toThrow("ALG_NOT_ALLOWED");
  });

  it("拒绝用公钥当作 HMAC 密钥签出的 HS256 token", () => {
    // 攻击者视角：alg 改成 HS256，密钥用公开的公钥内容
    const forged = signWith({ alg: "HS256" }, claimsOf("admin"), publicKeyPem);
    expect(() => verify(forged, [rsaKeys])).toThrow("ALG_NOT_ALLOWED");
  });

  it("拒绝改过载荷但签名未变的 token", () => {
    const [h, p, s] = validToken().split(".");
    const tampered = b64url(JSON.stringify({ ...claimsOf("user"), role: "admin" }));
    expect(() => verify(`${h}.${tampered}.${s}`, keys)).toThrow("BAD_SIGNATURE");
  });

  it("过期 token 被拒绝", () => {
    expect(() => verify(sign({ sub: "u1", exp: past() }), keys)).toThrow("EXPIRED");
  });

  it("签名长度异常时返回鉴权失败，而不是抛出未处理异常", () => {
    // 这条专门钉住 timingSafeEqual 的长度分支，
    // 防止它退化成 500 从而掩盖攻击痕迹
    const [h, p] = validToken().split(".");
    expect(() => verify(`${h}.${p}.${"A".repeat(999)}`, keys)).toThrow("BAD_SIGNATURE");
  });

  it("轮换期内旧密钥仍可验证", () => {
    const old = signWith({ kid: "old" }, claimsOf("u1"), oldSecret);
    expect(verify(old, [currentKey, oldKey]).claims.sub).toBe("u1");
  });
});
```

最后一条经常被忽略。密钥轮换的正确性没有别的验证手段，只能靠测试。没有它，轮换操作就成了一次无法预演的变更。

## 十、要不要用 JWT

把前面几节连起来看会发现，JWT 的每一项便利都对应一项成本。无状态换来的是无法即时失效，自包含换来的是载荷公开，跨服务可用换来的是密钥管理和轮换流程。

所以它成立的场景很具体：**有多个服务需要独立校验同一份身份声明，并且这些服务之间不方便共享 session 存储。**

如果只是单体应用的一个登录态，传统 session 通常更合适。它原生支持即时注销，不需要处理算法混淆，不需要设计轮换，载荷在服务端也不存在明文被读的问题。用 Redis 存 session 的成本，比正确处理上面那一整份清单要低。

把 JWT 换回 session 不是退步。真正要避免的是反过来：为了赶进度选了一个自己没打算维护的机制，然后把它当成"登录了就行"的黑盒。上面那些步骤里，算法白名单、密钥轮换、失效策略、回归测试，缺任何一条都不会立刻出问题，但都会在某个具体时刻变成事故。
