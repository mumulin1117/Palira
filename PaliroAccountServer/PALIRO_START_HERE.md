# Paliro 本地账号后端：从这里开始

这是第一阶段的真实本地后端，不是模拟接口。账号和资料写入独立数据库，关闭服务后不会丢失。

**ParamoboaxsDak已接入登录、最终注册、会话恢复和退出接口。视频、魔盒、关系及聊天继续使用现有本地数据，不迁移或重置。**

## 1. 启动：先只做这一步

打开 macOS 终端，执行：

```sh
cd /Users/linqian/Documents/Palira/PaliroAccountServer
./paliro-local.sh dev
```

看到 `Paliro local API: http://127.0.0.1:3001/docs/` 后，在浏览器打开：

- 可交互接口文档：http://127.0.0.1:3001/docs/
- 健康检查：http://127.0.0.1:3001/health
- OpenAPI 文档：http://127.0.0.1:3001/openapi.json

保持这个终端打开。停止时按 `Control + C`，等待终端重新出现命令提示符。

本机所需依赖已安装。启动脚本优先使用正常安装的 Node，找不到时使用此 Mac 的 Codex 内置 Node。
如果更换电脑，需要安装 Node.js 22.13+ 和 pnpm 11.19.0，然后执行 `./paliro-local.sh install`。
依赖版本由 `pnpm-lock.yaml` 固定，不需要你自己选择依赖版本。

## 2. 直接体验接口

在 `/docs/` 页面里依次操作：

1. 展开 `POST /v1/auth/register`，点击 **Try it out**，填写示例请求，再点 **Execute**。请用 `demo@example.test` 一类虚构邮箱及专用测试密码，不要使用真实个人资料或常用密码。
2. 成功状态是 **201**，返回 `user.id` 和 `accessToken`。注册成功后已经有一个会话，不必再登录。
3. 点击文档右上角 **Authorize**，填入刚返回的 `accessToken`，不加 `Bearer ` 前缀；文档会自动添加。
4. 执行 `GET /v1/me`，应看到刚注册的账号和注册时提交的全部资料，`profileComplete: true`。
5. 执行 `PATCH /v1/me`，可修改部分资料。服务端会检查真实日期和是否满18岁；新注册时已完成全部资料，无需再请求PATCH才能进入App。
6. 再执行 `GET /v1/me`，确认已保存。关闭并重新启动服务，再读取或重新登录，资料仍然存在。
7. 执行 `POST /v1/auth/logout`，返回 **204**（没有响应正文）。旧 token 再访问 `/v1/me` 应返回 **401**。
8. 执行 `POST /v1/auth/login`，重新获取 token 并 Authorize。用户ID和之前的资料不会改变。

页面刷新后需要重新 Authorize；文档不会把登录凭证永久保存在浏览器里。
重复注册同一邮箱返回 **409**，不是系统故障。可以改用新的虚构邮箱，或者使用登录接口。

## 3. 运行测试

无需先启动服务的自动化测试：

```sh
./paliro-local.sh test
```

测试使用内存库和自动清理的临时目录，不修改 `.paliro-data` 中你手动注册的账号。
覆盖注册、重复注册、错误密码、成年校验、两账号隔离、过期和退出、限流、删除、数据库重启恢复等。

服务正在运行时，在**另一个终端**执行真实 HTTP 测试：

```sh
cd /Users/linqian/Documents/Palira/PaliroAccountServer
./paliro-local.sh smoke
```

这会创建一个随机测试账号，完成注册、资料更新、退出、再次登录，最后只删除本次创建的账号。
如果短时间反复测试出现429，请等待一分钟后重试。

编译检查和编译后启动：

```sh
./paliro-local.sh build
./paliro-local.sh start
```

`dev` 直接运行 TypeScript，`start` 运行编译后的代码，二者不要同时启动。

## 4. 数据到底在哪里

- `.paliro-data/`：本服务的嵌入式 PostgreSQL 数据目录，启动时自动创建，已忽略，不进 Git。
- `.paliro-data.lock`：单进程保护锁，正常停止后自动删除。
- `paliro_users` 表：账号、密码哈希、个人资料、协议版本和时间。
- `paliro_sessions` 表：登录 token 的哈希、所属用户、创建和过期时间。
- `paliro_schema_migrations` 表：数据库结构版本，重启不会重复建表或重置账号。
- `paliro_retired_seeds` 表：明确删除预置测试账号后，记录不含个人资料的停用标记，避免重启自动重建它。

当前使用 **PGlite**，即嵌入式 PostgreSQL。它可以在 Node 中运行，不需要先安装 Docker、PostgreSQL 服务或创建云账号。
这不是独立部署的 PostgreSQL 服务，也不能让多个进程同时打开一个目录。正式后端阶段需增加独立 PostgreSQL 连接、数据迁移和备份方案，不是把这个目录直接搬到云服务器就完成上线。
目前使用参数化 SQL，暂未加入 Prisma，避免在第一步同时引入额外的数据库运行环境与适配器。

本地备份：先正常停止服务，再备份整个数据目录；不要在服务写入时直接复制目录并当作可靠备份。
恢复也应在服务停止时进行，并使用兼容的 PGlite 版本。不要删除目录来“修复登录失败”。

## 5. 可选配置

无需 `.env` 也能启动。需要改端口等设置时，可参照 `.env.example` 新建 `.env`：

| 配置 | 默认 | 含义 |
| --- | --- | --- |
| `PORT` | `3001` | 本机接口端口 |
| `PALIRO_DATA_DIR` | `.paliro-data` | 数据目录，相对本后端目录 |
| `PALIRO_SESSION_HOURS` | `24` | 会话有效小时数，允许1到168 |
| `PALIRO_CORS_ORIGINS` | 本地Vue开发地址及 `capacitor://localhost` | 精确来源白名单，不接受通配符 |
| `LOG_LEVEL` | `info` | 日志等级 |

只监听 `127.0.0.1`；拒绝公网绑定及 `NODE_ENV=production`。不要使用内网穿透公开它。
同一电脑上的iOS模拟器可以访问本机服务，App默认接口地址为 `http://127.0.0.1:3001`。真机无法把自己的localhost当成这台Mac；当前服务不开放局域网或公网。

## 6. 常见问题

| 现象 | 处理方法 |
| --- | --- |
| `node: command not found` | 用 `./paliro-local.sh`，它会检测本机内置Node；换电脑后安装Node LTS |
| 缺少依赖 | 执行 `./paliro-local.sh install`，首次安装需要联网 |
| `.env not found. Continuing without it.` | 只是提示正在使用默认配置，不是错误，继续等待启动地址即可 |
| `EADDRINUSE` | 3001已被使用；关闭之前启动的实例，或用 `.env` 改端口，不要随意结束未知进程 |
| 提示数据库锁 | 先确认之前的服务是否还在运行；正常停止后再启动。若异常断电留下锁，确认没有服务使用该目录后才移除**锁文件**，不能删除数据目录 |
| 浏览器无法连接 | 确认终端仍在运行且端口正确，不能只打开静态文档文件 |
| `401` | 缺少token、密码错误、token已过期或已退出；重新登录并Authorize |
| `400` | 看接口文档检查必填项、日期、语言与头像值，不能传入额外字段 |
| `403 ORIGIN_NOT_ALLOWED` | 浏览器来源不在白名单；根据实际开发地址配置，不使用 `*` |
| `429` | 请求超过限流，按 `Retry-After` 等待 |

## 7. 这一版明确不包含什么

- 不全量迁移旧localStorage。仅固定测试账号通过受控身份映射保留原数据；普通旧本地账号不按邮箱自动合并，需要重新服务器注册。
- 不发送邮件、不验证邮箱所有权、不提供密码找回；`emailVerified` 始终为false。
- 不自动创建不存在的登录账号，必须明确注册。
- 不提供refresh token；会话过期后重新登录，退出只撤销当前会话。
- 不上传头像、视频或语音；头像只是现有五款默认头像的标识。
- 不迁移魔盒、关注、聊天、金币或购买。未完善资料的账号目前只能使用账号接口，不能代表已取得社交权限。
- 不包含正式法律协议。`2026-09-local-v1` 只是联调版本，正式协议及同意流程需要上线前另行确认。
- 未完成正式安全审计、线上监控、容灾、多实例限流、邮件服务及独立PostgreSQL部署，不能直接开放真实用户。

App联调：先启动后端，再运行 `ParamoboaxsDak`。使用 `paliro@gmail.com` / `67896789` 验证测试账号列表；新账号在最后兴趣页面提交后才创建。已有测试账号会在后端启动时同步新密码，撤销旧会话但保留资料与用户ID，请重新登录。完整说明见 `../ParamoboaxsDak/PALIRO_AUTH_INTEGRATION.md`。该已知密码账号仅限本地联调，正式部署前必须重新设计测试账号和授权策略。

## 8. 代码位置

| 文件 | 用途 |
| --- | --- |
| `src/paliroServer.ts` | 启动、进程锁、安全停止 |
| `src/paliroConfig.ts` | 环境变量和仅本机运行保护 |
| `src/paliroApp.ts` | HTTP路由、鉴权入口、限流、跨域和文档 |
| `src/paliroAccounts.ts` | 注册、登录、资料、退出和删除业务 |
| `src/paliroSecurity.ts` | 密码哈希、token生成及解析 |
| `src/paliroDatabase.ts` | 数据库启动、事务迁移、表和索引 |
| `src/paliroSchemas.ts` | 请求校验及响应字段白名单 |
| `src/paliroTestAccount.ts` | 幂等预置本地测试账号，不覆盖原有资料 |
| `test/paliroAccounts.test.ts` | 隔离环境自动化测试 |
| `scripts/paliroSmoke.mjs` | 真正发HTTP请求的闭环测试 |
| `PALIRO_API.md` | 中文接口说明、请求示例、错误码 |

参考：[PGlite运行方式](https://pglite.dev/docs/about)、[PGlite持久化](https://pglite.dev/docs/filesystems)、[Fastify测试](https://fastify.dev/docs/latest/Guides/Testing/)、[OWASP密码存储建议](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)。
