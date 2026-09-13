# Paliro MySQL 部署与迁移

API 域名：`https://mobile.paliroweb.site`。Node 仍监听 `127.0.0.1:3300`，Nginx 与接口路径不需要调整。

## MySQL 资源

使用服务器现有 MySQL `127.0.0.1:6033`，创建专属 `paliro_account` 数据库，InnoDB + utf8mb4。

- 运行账号 `paliro_app`：仅本库 SELECT、INSERT、UPDATE、DELETE。
- 迁移账号 `paliro_migrate`：仅本库上述权限及 CREATE、ALTER、INDEX、REFERENCES。
- 自动化测试：另建 `paliro_account_mysql_test`，不能使用生产库。
- 服务器运行配置：`/srv/paliro/shared/paliro.env`，root 所有、权限600，systemd读取。
- 发布目录：`/srv/paliro/releases/<版本>`；服务名：`paliro-account.service`。

运行代码、依赖和 systemd 不再使用 `/srv/paliro/data/db` 或其锁文件。原数据只作为迁移来源和回滚备份保留。

## 建表和初始化

用迁移账号环境变量运行 `node scripts/paliroMysqlMigrate.mjs`。迁移通过 MySQL GET_LOCK 串行化，DDL 可重试；日常 API 启动只校验版本，不需要建表或全局权限。

全新安装完成建表后可直接启动 API，自动预置验收账号。迁移旧数据时必须先导入、后启动，避免预置账号占用空库。

## 从旧数据库切换

1. 保持旧服务运行，先完成新版本编译、真实 MySQL 集成测试、发布上传、安装依赖和目标库建表。
2. 仅停止 `paliro-account.service`，将旧配置与数据目录归档到仅 root 可读的备份目录。
3. 用 `scripts/paliroLegacyExport.mjs` 指定旧发布版本的数据库模块、旧数据目录和新的导出路径。旧服务锁未释放时工具拒绝导出。
4. 用新版本的 `scripts/paliroMysqlImport.mjs` 向 MySQL 导入。目标库必须为空；用户、会话、停用标记在同一事务导入，逐字段哈希核对不一致则回滚。
5. 将运行环境切换为 MySQL 专属运行账号，切换 current 链接，更新 Paliro systemd 文件并启动。
6. 核对迁移前 Token 仍可读本人资料、用户 ID 与资料一致，运行 HTTPS Smoke 测试，确认原有其他服务仍运行。

迁移保留用户ID、密码哈希、会话哈希和到期时间，既有登录不需要因为换库失效。日期按 UTC 和毫秒保存，生日保持原字符串，韩文和emoji使用utf8mb4。

若导入前或切换验证失败，恢复旧配置/current并启动旧服务。新库已经接受业务写入后，不能直接回到旧数据库，否则会丢失切换后的数据；应先暂停写入并评估差异。

## 验证与运维

```sh
curl --fail https://mobile.paliroweb.site/health
PALIRO_API_URL=https://mobile.paliroweb.site PALIRO_ALLOW_REMOTE_SMOKE=1 node scripts/paliroSmoke.mjs
systemctl status paliro-account.service
journalctl -u paliro-account.service -n 50 --no-pager
```

MySQL 备份使用专属备份账号运行 `mysqldump --single-transaction --no-tablespaces --set-gtid-purged=OFF paliro_account`；密码放在权限600的配置文件，输出备份同样限制权限。不要备份正在写入的原始 MySQL 数据文件。需要另行安排自动备份、保留周期和恢复演练。

当前共享验收账号在生产模式下不可删除，普通账号可以正常删除。MySQL 连接池为4，应用不修改其他数据库、用户、端口或 MySQL 全局设置。
