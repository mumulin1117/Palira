# MySQL 切换记录

2026-09-13 已完成线上与本地调试服务切换。API域名、接口路径、JSON字段、用户UUID和密码保持兼容。App UI、本地社交数据及iOS工程未修改。

## 数据与运行位置

| 环境 | MySQL 库 | 迁移用户 | 迁移会话 | 运行账号 |
| --- | --- | --- | --- | --- |
| 线上 | paliro_account | 1 | 2 | paliro_app@127.0.0.1 |
| 本地调试 | paliro_account_dev | 3 | 10 | paliro_dev@127.0.0.1 |
| 集成测试 | paliro_account_mysql_test | 临时测试数据 | 临时测试数据 | paliro_dev@127.0.0.1 |

线上连接服务器127.0.0.1:6033，本地通过SSH隧道127.0.0.1:16033连接。运行账号只能读写生产库；迁移账号为paliro_migrate，仅在生产库有建表与迁移权限。开发账号仅访问开发/测试库。

原管理账号没有GRANT OPTION，但具备CREATE USER、mysql.db写权限和RELOAD。本次为新Paliro账号添加了精确到库的MySQL 5.7授权记录，并加载权限；没有提升原管理账号权限。对原有mysql.user和mysql.db记录的前后比对一致。运行账号访问MySQL管理表、独立测试库均被拒绝。

线上旧数据备份：`/srv/paliro/backups/mysql-cutover-2026-09-13T09-34-48-300Z/`。本地旧数据备份：`.paliro-backups/mysql-cutover-20260913/`。备份仅用于恢复，不再被API读取；其中包含私有账号信息和会话哈希，禁止发布。

## 验证

- 32项真实MySQL集成测试通过，包括两套接口、注册事务、重复邮箱、密码校验、权限隔离、英韩及emoji、生日、会话到期、删除级联和重连持久化。
- 迁移逐字段哈希核对用户、会话和停用标记，导入事务全部成功；线上切换前的Token在切换后仍可读取同一份用户资料。
- MySQL非法外键导入会回滚全部用户和会话；目标已有数据时拒绝覆盖。
- 外网HTTPS完整账号闭环测试通过，临时测试用户已删除。
- 线上四张表均为InnoDB。其余social-contact-api、gather、met47-gathering服务仍为active。
- 不涉及UI、SafeArea或键盘修改，本轮不重复进行iOS界面编译和视觉测试。

## 文件清单

以下后端路径均相对于PaliroAccountServer：

| 文件 | 本次变更 |
| --- | --- |
| src/paliroDatabase.ts | mysql2连接池、预编译查询、事务、UTC/JSON转换、MySQL建表与版本检查 |
| src/paliroAccounts.ts | MySQL兼容读写、重复邮箱错误码、事务内回读、删除级联 |
| src/paliroTestAccount.ts | MySQL JSON默认兴趣、保留固定验收身份 |
| src/paliroConfig.ts | MySQL连接配置与环境校验 |
| src/paliroServer.ts | 移除PGlite目录及文件锁，启动连接MySQL |
| src/paliroApp.ts | 使用数据库接口类型，HTTP协议不变 |
| src/paliroLegacyImport.ts | 空库导入、逐字段哈希核对、事务回滚 |
| scripts/paliroLegacyExport.mjs | 一次性读取旧版本PGlite并导出，不是运行依赖 |
| scripts/paliroMysqlImport.mjs、scripts/paliroMysqlMigrate.mjs | 导入及建表命令 |
| scripts/paliroMysqlProvision.mjs | 专属生产/迁移账号配置与已有权限核对 |
| scripts/paliroMysqlCutover.mjs | 备份、停服务、导入、旧Token验证、切换和失败恢复 |
| scripts/paliroMysqlDevelopment.mjs | 开发/测试隔离库及私有环境文件生成 |
| test/paliroAccounts.test.ts、test/paliroWireClient.test.ts | 原接口测试改跑真实MySQL |
| test/paliroMysqlTestDatabase.ts | 测试库命名与显式开关保护 |
| test/paliroMysqlMigration.test.ts | 迁移完整性、回滚和代理限流测试 |
| package.json、pnpm-lock.yaml | 移除PGlite依赖，增加mysql2及迁移命令 |
| paliro-local.sh、.env.example、.gitignore | 本机运行入口、MySQL配置、备份忽略规则 |
| deploy/paliro-account.service、deploy/paliro.production.env.example | 移除目录写入配置，使用MySQL参数 |
| PALIRO_START_HERE.md、PALIRO_API.md、PALIRO_PRODUCTION_DEPLOYMENT.md | 更新启动、接口、备份、迁移说明 |
| ../ParamoboaxsDak/PALIRO_AUTH_INTEGRATION.md | 说明账号后端改用MySQL，客户端协议不变 |

`.env`与`.env.test`为本机生成的私有配置，不进入版本控制。线上密码仅在服务器root可读的环境文件中。
