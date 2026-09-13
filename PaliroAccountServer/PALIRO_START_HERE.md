# Paliro MySQL 账号后端

账号服务使用 MySQL，通过 mysql2 连接池读写 InnoDB 表。不再创建或读取 PGlite 数据目录。App 接口路径、字段、用户 ID 映射和本地社交数据逻辑不变。

## 在电脑上启动

这台电脑已配置 `.env` 和 `.env.test`，均为权限600的私有文件，不进入 Git。开发库为 `paliro_account_dev`，测试库为 `paliro_account_mysql_test`，通过本机16033端口的 SSH 隧道连接服务器 MySQL。当前隧道及本地3001服务已启动。

重启电脑或关闭隧道后，先在一个终端保持以下命令运行，再在另一个终端执行 `./paliro-local.sh dev`。首次使用时输入服务器 SSH 密码；不需要把密码写入命令。

```sh
ssh -N -o ExitOnForwardFailure=yes -L 127.0.0.1:16033:127.0.0.1:6033 root@43.159.196.246
```

如果16033已被当前隧道占用，不要重复启动；可直接运行本地后端。线上 App 使用生产域名，不依赖这台电脑的隧道。

新电脑需要 Node.js 22.13+、pnpm 11.19.0，以及可访问的 MySQL 5.7 或 8.x。连接本机 MySQL，或通过 SSH 将专属开发库转发到回环端口；不要将开发配置指向生产库。

1. 由 MySQL 管理员创建 `paliro_account_dev` 库，字符集 `utf8mb4`，并创建仅访问此库的开发账号。
2. 在项目中配置 `.env`，字段参考 `.env.example`。密码不提交 Git。
3. 依次执行下面的命令。首次建表使用有本库 CREATE 权限的账号；日常运行只需 SELECT、INSERT、UPDATE、DELETE。

```sh
cd /Users/linqian/Documents/Palira/PaliroAccountServer
./paliro-local.sh install
./paliro-local.sh build
./paliro-local.sh migrate
./paliro-local.sh dev
```

本机接口文档为 `http://127.0.0.1:3001/docs/`。生产 API 域名仍为 `https://mobile.paliroweb.site`，配置、迁移和切换步骤见 `PALIRO_PRODUCTION_DEPLOYMENT.md`。

## 配置

| 变量 | 默认/示例 | 作用 |
| --- | --- | --- |
| `PALIRO_MYSQL_HOST` | `127.0.0.1` | 本机 MySQL 或 SSH 隧道 |
| `PALIRO_MYSQL_PORT` | `3306` | 线上现有 MySQL 为6033 |
| `PALIRO_MYSQL_DATABASE` | `paliro_account_dev` | 专属数据库，必须以 paliro_ 开头 |
| `PALIRO_MYSQL_USER` | `paliro_dev` | 专属账号，必填 |
| `PALIRO_MYSQL_PASSWORD` | 自行配置 | 必填，不写入代码 |
| `PORT` | `3001` | API 回环监听端口 |
| `PALIRO_SESSION_HOURS` | `24` | 会话时长，1到168小时 |
| `PALIRO_CORS_ORIGINS` | 参考环境变量模板 | 精确允许来源 |
| `PALIRO_PUBLIC_ORIGIN` | `https://mobile.paliroweb.site` | 生产模式必填 |

连接统一使用 UTC；生日始终按 YYYY-MM-DD 字符串读写，兴趣使用 JSON，布尔值在响应前转换。池大小为4，不更改 MySQL 全局参数。

## 自动化测试

测试直接运行在真实 MySQL 上，必须使用单独的 `paliro_*_test` 库和测试账号。测试会清理这个库的账号数据，严禁填生产数据库。

在 `.env.test` 中填写测试库连接参数，并设置 `PALIRO_ALLOW_DATABASE_TESTS=1`。测试入口还会验证数据库命名，不满足条件即终止。

```sh
./paliro-local.sh test
```

覆盖注册、登录、英韩与表情存储、重复注册、事务回滚、用户隔离、资料更新、会话过期、退出、删除级联、连接重建、数据迁移校验和接口契约。

真实 HTTP 闭环测试：

```sh
./paliro-local.sh smoke
```

它只创建和删除本次随机账号。测试既有验收账号请只登录、读取资料、退出，不使用它做删除测试。

## 查看数据

使用数据库客户端连接你的 MySQL，在 `paliro_account`（开发环境为 `_dev`）中查看：

- `paliro_users`：用户 ID、邮箱、密码哈希、资料和协议记录。
- `paliro_sessions`：会话哈希、用户 ID、有效期。
- `paliro_retired_seeds`：已删除预置账号的停用标记。
- `paliro_schema_migrations`：MySQL 表结构版本。

数据库没有明文密码或原始 Token。使用接口文档登录后 Authorize，可用 GET `/palirov1/paliro/me/profile` 查看当前账号资料。

## 排错与边界

`ECONNREFUSED`：检查 MySQL/SSH 隧道和端口。`ER_ACCESS_DENIED_ERROR`：核对账号、密码及授权来源。缺少表：先运行 migrate。401：重新登录；429：按 Retry-After 等待。

视频、魔盒、关系、消息和自选头像仍保存在 App 现有本地数据层。本次只替换账号服务数据库。注册在最后兴趣步骤提交完整资料，成功直接进入主模块；固定验收账号身份不变。邮件验证、找回密码和媒体上传尚未实现。

实现参考：[mysql2 文档](https://sidorares.github.io/node-mysql2/docs/documentation)、[MySQL JSON 类型](https://dev.mysql.com/doc/refman/5.7/en/json.html)。
