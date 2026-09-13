# Paliro 账号 API v0.3

本机 Base URL：`http://127.0.0.1:3001`；生产 Base URL：`https://mobile.paliroweb.site`。JSON接口统一使用 `Content-Type: application/json`。
本文件供阅读；实时OpenAPI由同一套路由校验规则生成，位于 `/openapi.json`，交互界面位于 `/docs/`。

数据库已改为 MySQL/InnoDB，账户、会话和资料由专属 `paliro_account` 库保存。字段、接口路径及验收账号 UUID 保持原样；数据库密码不下发客户端。迁移及线上切换步骤见 `PALIRO_PRODUCTION_DEPLOYMENT.md`。

## v0.2 兼容约定

新版 App 只调用 `/palirov1/paliro` 接口。旧 `/v1/auth/register`、`/v1/auth/login`、`/v1/auth/logout` 和 GET/PATCH/DELETE `/v1/me` 暂时保留，并在 Swagger 中标记为 deprecated；旧接口继续使用旧字段，不混用两套 JSON。两套接口共用账号、会话和业务校验，注册、登录、删除的限流也按对应操作共享。

| 原字段（数据库和 App 内部仍使用） | 新接口 JSON 字段 |
| --- | --- |
| `profile` | `palirovmemberProfile` |
| `nickname` | `palirovdisplayName` |
| `avatar` | `palirovavatarKey` |
| `birthday` | `palirovbirthDate` |
| `bio` | `palirovaboutMe` |
| `interests` | `palirovinterestTags` |
| `mood` | `palirovcurrentMood` |
| `language` | `palirovpreferredLanguage` |

`email`、`password`、`gender`、`user`、`id`、Token、协议和时间字段不变。注册使用资料包装对象，GET/PATCH 的用户响应包含该对象；PATCH 请求直接提交部分新字段，不加 `palirovmemberProfile` 包装。数据库无需迁移或清空，旧账号和未过期会话可继续使用。仅重命名协议字段，不改变英文/韩文枚举值。

## 通用规则

- 除健康检查、文档、注册和登录外，需要 `Authorization: Bearer <accessToken>`。
- Token不是JWT，是32字节随机生成的不透明凭证。数据库仅保存SHA-256哈希。
- 默认24小时过期；没有自动续期。登录可创建另一个会话，退出只撤销当前会话。
- 新注册密码8到128字符，不trim，不明文存储；采用随机盐+scrypt。预置本地测试账号密码为 `67896789`，同样为8位。
- 邮箱trim后转小写，大小写不同视为同一账号；数据库唯一约束阻止并发重复注册。
- 请求体最大16KiB。不接受额外字段或隐式类型转换，如 `acceptedTerms: "true"` 不合法。
- 账号接口按IP限流；注册、登录、删除各10次/分钟，其他接口默认每路由120次/分钟。重启会重置内存限流，不是多实例方案。
- 不接受客户端传入userID来选择目标账号；服务器从token推导身份。
- 默认不记录请求体、密码或token。响应不缓存，用户响应只序列化公开字段白名单。
- 业务字段错误码稳定，前端以后按 `error.code` 显示英韩本地化文案，不依赖英文message做判断。

## 接口一览

| 方法 | 路径 | 成功状态 | 用途 |
| --- | --- | --- | --- |
| GET | `/health` | 200 | 同时检查API及数据库 |
| POST | `/palirov1/paliro/auth/register` | 201 | 注册并获得会话 |
| POST | `/palirov1/paliro/auth/login` | 200 | 验证密码，获得新会话 |
| GET | `/palirov1/paliro/me/profile` | 200 | 读取当前账号资料 |
| PATCH | `/palirov1/paliro/me/profile` | 200 | 完善或部分更新资料 |
| POST | `/palirov1/paliro/auth/logout` | 204 | 撤销当前会话，重复操作安全 |
| DELETE | `/palirov1/paliro/me/account` | 204 | 输入密码后删除本后端账号及全部会话 |

## 注册

```http
POST /palirov1/paliro/auth/register
Content-Type: application/json

{
  "email": "demo@example.test",
  "password": "Example-only-12345",
  "acceptedTerms": true,
  "termsVersion": "2026-09-local-v1",
  "palirovmemberProfile": {
    "palirovdisplayName": "Paliro Demo",
    "palirovavatarKey": "violet",
    "palirovbirthDate": "1998-10-24",
    "palirovaboutMe": "Coffee and quiet walks.",
    "palirovinterestTags": ["Coffee", "Nature", "Music"],
    "palirovpreferredLanguage": "en",
    "palirovcurrentMood": "Want to Chat",
    "gender": "Other"
  }
}
```

成功响应结构：

```json
{
  "user": {
    "id": "服务器生成的UUID",
    "email": "demo@example.test",
    "emailVerified": false,
    "profileComplete": true,
    "isTestAccount": false,
    "palirovmemberProfile": {
      "palirovdisplayName": "Paliro Demo",
      "palirovavatarKey": "violet",
      "palirovbirthDate": "1998-10-24",
      "palirovaboutMe": "Coffee and quiet walks.",
      "palirovinterestTags": ["Coffee", "Nature", "Music"],
      "palirovpreferredLanguage": "en",
      "palirovcurrentMood": "Want to Chat",
      "gender": "Other"
    },
    "terms": {
      "version": "2026-09-local-v1",
      "acceptedAt": "2026-09-13T12:00:00.000Z"
    },
    "createdAt": "2026-09-13T12:00:00.000Z",
    "updatedAt": "2026-09-13T12:00:00.000Z"
  },
  "accessToken": "仅在响应中返回的随机凭证",
  "tokenType": "Bearer",
  "expiresAt": "2026-09-14T12:00:00.000Z"
}
```

日期为示例；真实值由服务器生成。重复邮箱返回409，未同意或协议版本不匹配返回400。
App只在完成兴趣选择后的最后一步调用本接口。`palirovmemberProfile`中的全部字段必填，注册昵称和签名去空白后不能为空，签名最多150字符，兴趣至少3项。服务器检查成年生日后，在同一事务中创建账号、完整资料和会话；校验失败不留下半注册账号。成功后可直接进入主模块，无需再请求登录。

本地启动会预置 `paliro@gmail.com` / `67896789`，固定服务器ID为 `80962768-0000-4000-8000-000000000001`，`isTestAccount: true`。该邮箱不能公开注册，标识也不能由客户端提交。App将这一经过服务器认证的身份映射回原有 `paliro-test-user`，保留本地关系、消息及发布记录。已有测试账号启动时会同步指定密码；密码发生变化时撤销该账号旧会话，但不覆盖资料、删除用户或影响其他账号。密码已经一致时不重复撤销会话；此已知密码账号仅限本地联调。

## 登录

```http
POST /palirov1/paliro/auth/login
Content-Type: application/json

{
  "email": "demo@example.test",
  "password": "Example-only-12345"
}
```

成功响应与注册相同，用户ID稳定、token更新。不存在的账号、密码错误、禁用账号统一返回401 `INVALID_CREDENTIALS`，不会自动注册。

## 读取资料

```http
GET /palirov1/paliro/me/profile
Authorization: Bearer <accessToken>
```

返回注册响应中的 `user` 对象本身，不额外包裹 `{user: ...}`。
不返回密码哈希、会话哈希，也没有按任意用户ID读取私人资料的接口。

## 完善或修改资料

```http
PATCH /palirov1/paliro/me/profile
Content-Type: application/json
Authorization: Bearer <accessToken>

{
  "palirovdisplayName": "Paliro Demo",
  "palirovavatarKey": "violet",
  "palirovbirthDate": "1998-10-24",
  "palirovaboutMe": "Coffee and quiet walks.",
  "palirovinterestTags": ["Coffee", "Nature"],
  "palirovpreferredLanguage": "en"
}
```

| 字段 | 校验 |
| --- | --- |
| `palirovdisplayName` | 去掉首尾空白后不能为空，最多32字符 |
| `palirovavatarKey` | `violet`、`blue`、`coral`、`mint`、`golden`之一 |
| `palirovbirthDate` | 真实的YYYY-MM-DD日期，1900年起，按服务器UTC日期计算需满18岁 |
| `palirovaboutMe` | 最多280字符，可以传空字符串清空 |
| `palirovinterestTags` | 最多20项，不可重复，PATCH允许空数组清空；注册至少3项 |
| `palirovpreferredLanguage` | 仅 `en` 或 `ko` |
| `palirovcurrentMood` | Want to Chat、Feeling Happy、A Little Shy、Feeling Chill、Ready for Fun、A Little Lonely之一 |
| `gender` | Male、Female、Other之一 |

兴趣值：Gaming、Music、Travel、Fitness、Movies、Reading、Photography、Cooking、Art、Technology、Fashion、Sports、Anime、Dancing、Pets、Nature、Coffee、Nightlife。

第一次修改必须让昵称和生日完整。之后可以只传需修改的字段，遗漏字段不会重置；空对象、null、额外字段会被拒绝。
默认头像key由App适配层映射到现有头像资源，不是远程图片URL。
成功返回完整当前用户对象，`profileComplete` 为true。

## 退出与删除

退出：`POST /palirov1/paliro/auth/logout`，携带Bearer，不需要body，成功204。已撤销或过期但格式有效的token再次退出也返回204；缺少或格式错误返回401。账号和资料不删除，其他设备会话不受影响。

删除：`DELETE /palirov1/paliro/me/account`，携带Bearer和JSON：

```json
{ "password": "Example-only-12345" }
```

密码再次验证成功后，删除当前后端账号，数据库外键级联删除所有会话，返回204。其他账号不受影响。
App设置的删除入口已接入此接口，要求密码确认且只能在收到204后执行本机账号缓存清理。接口本身不访问localStorage；未来迁移的视频、消息、备份等仍需单独设计服务器删除策略。当前账号的所有会话由数据库外键级联删除，其他账号不受影响。

若删除本地预置测试账号，事务内同时在`paliro_retired_seeds`记录`test-account`停用标记，不存邮箱或资料，防止重启重新预置。普通用户删除不留下这类标记。此行为不可通过重新启动恢复测试账号，验收请使用临时账号。

## 统一错误

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect.",
    "requestId": "req-3"
  }
}
```

| HTTP状态 | code | 含义 |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | 缺少字段、类型不对、非法枚举、未知字段或JSON损坏 |
| 400 | `TERMS_REQUIRED` | 未接受当前版本协议 |
| 400 | `INVALID_NICKNAME` | 昵称只有空白 |
| 400 | `INVALID_BIRTHDAY` | 日期不真实或早于1900年 |
| 400 | `AGE_RESTRICTED` | 未满18岁或未来生日 |
| 400 | `PROFILE_INCOMPLETE` | 首次资料缺少昵称或生日 |
| 401 | `INVALID_CREDENTIALS` | 邮箱或密码无效，或账号禁用 |
| 401 | `UNAUTHORIZED` | 没有有效的当前会话 |
| 403 | `ORIGIN_NOT_ALLOWED` | 请求的浏览器来源不允许 |
| 403 | `TEST_ACCOUNT_PROTECTED` | 生产环境的共享验收账号不可删除 |
| 404 | `NOT_FOUND` | 接口不存在 |
| 409 | `EMAIL_IN_USE` | 邮箱已经注册 |
| 413 | `PAYLOAD_TOO_LARGE` | 请求超过16KiB |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | 非支持的请求Content-Type |
| 429 | `RATE_LIMITED` | 请求过多，等待Retry-After指定秒数 |
| 503 | `AUTH_BUSY` | 同时密码运算过多，稍后重试 |
| 500 | `INTERNAL_ERROR` | 内部错误，不对外泄露SQL或敏感字段 |

## Vue接入

```js
const response = await fetch('http://127.0.0.1:3001/palirov1/paliro/me/profile', {
  headers: { Authorization: `Bearer ${accessToken}` },
})
const result = await response.json()
if (!response.ok) {
  // 按result.error.code处理；不能把接口失败变成本地登录成功。
  throw new Error(result.error.code)
}
// result.id作为服务端身份依据，测试账号通过受控映射沿用旧本地ID。
```

上面仅展示请求格式。完整客户端位于 `ParamoboaxsDak/src/services/paliroAccountApi.js` 和 `paliroServerSession.js`：iOS凭证存入Keychain，浏览器联调存入sessionStorage；启动时通过GET /palirov1/paliro/me/profile验证。没有服务器成功响应时，不能降级成本地登录成功。

App本人个人中心和编辑页现已接入GET `/palirov1/paliro/me/profile`；编辑保存使用PATCH `/palirov1/paliro/me/profile`，只传实际修改的支持字段，返回成功后更新本地资料缓存。读取失败展示带提示的缓存；保存失败保留草稿，401提示重新登录。自选照片仅存本机，不提交`photoDataUrl`，也不会被服务器字段覆盖。应用语言偏好仍走原有本地逻辑；其他用户主页及模拟社交数据不在本接口范围内。
