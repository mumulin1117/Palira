# Paliro 登录注册接口联调

## 当前接口协议

App 统一使用 `/palirov1/paliro`：注册、登录、退出为 `/auth/register`、`/auth/login`、`/auth/logout`；读写本人资料为 GET/PATCH `/me/profile`；删除账号为 DELETE `/me/account`。

注册请求和用户响应将 `profile` 改为 `palirovmemberProfile`；资料字段依次为 `palirovdisplayName`、`palirovavatarKey`、`palirovbirthDate`、`palirovaboutMe`、`palirovinterestTags`、`palirovcurrentMood`、`palirovpreferredLanguage`，`gender` 不变。PATCH 直接提交改动的新字段，不加资料包装对象。

`paliroAccountApi.js` 负责双向转换，App 页面、本地缓存、测试账号关系和消息仍使用原有内部字段，不需要清空数据。照片仍按原规则保存在本机。后端保留旧协议供旧版客户端使用，新版 App 不会在失败时回退旧接口。更新服务后需重新启动后端，并重新构建/同步 iOS Web 资源。

## 启动

先在一个终端保持后端运行：

```sh
cd /Users/linqian/Documents/Palira/PaliroAccountServer
./paliro-local.sh dev
```

另一个终端运行前端（已安装Node/npm时）：

```sh
cd /Users/linqian/Documents/Palira/ParamoboaxsDak
npm run dev -- --host 127.0.0.1 --port 5173
```

开发接口默认 `http://127.0.0.1:3001`，示例见 `.env.example`；生产构建由 `.env.production` 固定使用 `https://mobile.paliroweb.site`。修改环境变量后必须重新构建，iOS还要重新执行 Capacitor copy。服务器上的 Node 服务仍只监听 `127.0.0.1:3300`，公网只能通过该子域的独立 Nginx HTTPS 反向代理访问。

iOS打包：`npm run build` 后运行 `npx cap copy ios`，再在Xcode运行 `ios/App/App.xcworkspace`。原有build脚本已修正为真正执行 `vite build`。

## 数据边界

- 登录：POST `/palirov1/paliro/auth/login` 成功才保存会话并进入首页；错误密码、离线、超时不能退回本地验证，也不自动创建未知账号。
- 注册：邮箱密码页面及个人资料前两步仅保留内存草稿；最后兴趣页面点击完成，一次POST `/palirov1/paliro/auth/register` 提交邮箱、密码、协议同意及完整资料。返回201后直接进入主模块，不再请求登录。失败保留草稿，连续点击不会重复请求。
- 完整资料：昵称、默认头像key、生日、签名、性别、状态、兴趣、语言。普通注册密码至少8位，成年生日和至少3个兴趣由服务器再次校验。
- 测试账号：`paliro@gmail.com` / `67896789`，只有后端认证返回受控测试标识及保留UUID，才映射为本地 `paliro-test-user`。原有关系列表、聊天、已发动态及本地修改资料继续沿用，不重新生成一套。后端启动时同步指定的新密码并撤销该账号旧会话，更新后需重新登录；不会影响其他账号。
- 新普通账号：服务器UUID作为本地用户ID，账号数据相互隔离，没有测试账号的预置关系和消息。
- 本人个人资料：进入个人中心或编辑页会GET `/palirov1/paliro/me/profile`，成功后服务器支持的字段更新本地缓存；编辑保存只PATCH实际修改的字段，成功才更新显示。昵称、签名、生日、性别、状态、兴趣及默认头像标识以服务器返回为准。
- 自选头像照片：后端尚无文件上传接口，沿用本地保存并明确提示“仅保存在此设备”。照片不会作为额外字段提交，也不会被GET/PATCH返回覆盖；换设备不会自动带上照片。
- 视频、魔盒、聊天、关系、他人主页模拟资料及语言设置仍沿用现有本地数据，本次不为这些模块新增接口。
- 普通旧本地账号未自动迁移；不按未验证邮箱合并身份。升级后旧本地会话不能继续作为认证凭据，需要重新服务器登录或注册。其他用户数据不清除。

## 会话与异常

iOS将服务端token保存到Keychain（设备内可用，不同步到其他设备）；浏览器联调存到sessionStorage，同一标签刷新可恢复，关闭标签后需重新登录。普通localStorage只存用户资料及本地身份元信息，不写入新账号密码或真实服务端token。

iOS卸载重装：原生层在`UserDefaults`保存安装实例标识。正常升级和日常启动保留Keychain登录；卸载会移除该标识，重装首次启动时先删除同Bundle ID遗留的Keychain Token，因此必须重新登录。为兼容加入机制前已登录的旧版本，首次升级若仍检测到本地会话，会保留一次凭证并建立标识；卸载后本地会话不存在，不会走这条迁移路径。主动退出不会删除安装标识。

本轮修改位于`ParamoboaxsDak/ios/App/App/PaliroBridgeViewController.swift`、`src/services/paliroAccountApi.js`、`scripts/paliro-server-auth.test.mjs`和本文档。验证包括升级/重装分支单测、全部前端回归测试、Vite生产构建、Capacitor iOS资源同步和iOS模拟器工程编译。没有实际卸载当前模拟器中的用户App，避免破坏已有本地测试数据；请按“登录 > 删除App > 重新安装”做一次最终黑盒验收。

启动后先GET `/palirov1/paliro/me/profile`校验会话，通过才进入主模块。默认24小时过期，没有refresh token；到期或401需重新登录。服务未启动时显示连接失败，不假装登录成功。

退出清除本地登录标记和安全凭证，并尝试撤销服务器当前会话，不删除资料或其他账号数据。离线时远端撤销可能失败，远端会话按原过期时间失效。

若服务器已创建账号但响应途中断网，重试可能提示邮箱已注册，此时返回登录即可，不能重复创建账号。被旧版本后端创建的未完整账号登录后会补资料，最终PATCH再进入首页。

## 验收

1. 后端运行时，用测试账号错误密码登录，应停留登录页；正确密码成功后，消息和关系列表与原来一致。退出再登录后，新增的消息及动态仍在。
2. 用新的测试邮箱填写注册表，查看网络：点击Sign Up、资料第一步、第二步都不发注册请求。选择至少3个兴趣后点击完成，只发送一次register，body带完整profile；成功直接进入首页。
3. 断网或停止服务器后提交，应显示英/韩错误提示且保留草稿，不能进入首页。恢复服务后重试。
4. 新账号退出并再次登录、刷新，用户ID和资料保持一致；账号之间不显示彼此的关系/消息缓存。
5. 320px小屏和大屏检查布局、输入滚动、安全区；真机软件键盘与Keychain读写需继续做设备验收。

自动化：`node --test scripts/*.test.mjs`。后端：在后端目录 `./paliro-local.sh test`，服务启动后另运行 `./paliro-local.sh smoke`。浏览器完整联调脚本为 `scripts/paliro-auth-browser.mjs`，需Playwright模块及Chrome；可用 `PALIRO_PLAYWRIGHT_MODULE`指定模块入口，测试只清理自己创建的随机账号。

账号后端现已改为 MySQL 实现，使用服务器现有实例中的专属 Paliro 数据库，切换步骤见 `../PaliroAccountServer/PALIRO_PRODUCTION_DEPLOYMENT.md`。App 的 HTTPS 域名、接口、字段和测试身份映射均不变。正式开放大量真实用户前仍需完善自动备份、监控告警、邮件验证、密码找回和正式协议版本。

## 删除账号

设置 > 删除账号，现在是实际删除，不再只是说明弹窗。输入当前密码并点击红色删除按钮后，发送 `DELETE /palirov1/paliro/me/account`，携带Bearer及 `{ "password": "当前密码" }`。只有HTTP 204才确认为成功。

- 取消或点击遮罩：清空密码草稿并关闭，不调用删除接口。
- 密码错误：保留账号、登录凭证和本地数据，提示重新输入；过期的会话提示重新登录。
- 网络失败或超时：说明结果尚未确认，不进行本地清理；服务器可能已经收到请求，不能保证远端未删除。可恢复连接后重试或重新登录核对。
- 成功：服务器删除账号、完整资料及该账号所有会话；App清除当前登录凭证，以及该本地用户ID下的资料、头像数据、关系、消息、动态、视频记录、金币/测试状态和偏好缓存，然后返回欢迎页。不会清空整个localStorage，不影响其他用户或设备级协议同意状态；不会删除用户相册原文件。
- 本机清理异常：仍退出已删除的账号，明确提示服务器已删除但本机清理不完整，不错误提示“服务器删除失败”。
- 本地开发模式允许明确删除测试账号并记录预置停用标记；生产环境会拒绝删除共享验收账号，避免公开的验收凭证导致该账号永久丢失。普通账号在两种环境中都可正常删除，请用新注册的临时账号做删除验收。

本轮主要文件（相对于工作区）：`ParamoboaxsDak/src/PaliroEntryApp.vue`（确认弹窗、密码、防重复提交和退出）、`src/services/paliroAccountApi.js`（DELETE及204校验）、`src/services/paliroServerSession.js`（凭证与成功后的清理结果）、`src/services/paliroLocalStore.js`（按用户ID清理）、`src/services/paliroI18n.js`（英韩删除文案）、`src/style.css`（可视视口、滚动和安全区）、`scripts/paliro-account-deletion.test.mjs`及`scripts/paliro-auth-browser.mjs`（单测和真实临时账号删除）、本说明，以及`PaliroAccountServer/src/paliroAccounts.ts`、`src/paliroDatabase.ts`、`src/paliroTestAccount.ts`、`test/paliroAccounts.test.ts`（删除事务和预置停用）。更新的API说明在`PaliroAccountServer/PALIRO_API.md`，构建产物同步到前端`dist`及iOS `App/public`。

验收步骤：用新临时账号登录，设置中先取消删除，再用错误密码确认，均应保留账号；用正确密码确认后应返回欢迎页，原密码登录及旧Token读取资料均返回401。浏览器脚本仅删除本次创建的随机账号，不删除已有固定测试账号。真机软件键盘需要另行验收；弹窗使用visualViewport及内部滚动适配键盘可用高度。

## 个人资料接口与本地协作

查看失败：本人个人中心保留本地缓存，显示“无法刷新，正在显示本机资料”。编辑页读取期间暂时禁用输入，避免正在填写时被后到的响应覆盖；失败后可以继续编辑。

保存失败：断网、超时、校验失败不会假装保存到服务器，也不会用本地保存替代远端成功；留在编辑页、保留草稿，可重试。401或过期会提示重新登录。不自动丢弃用户正在输入的内容，也不以缓存绕过认证。

支持字段以服务器为准：首次查看时，以前仅在本机编辑且从未上传的字段可能被服务器已有值替换；不自动将旧缓存批量覆盖服务器。自选照片及本地关系、消息、动态不参与覆盖。应用语言偏好仍沿用原有本地设置，不随资料GET改变。

后台核对：App修改昵称/签名并保存后，用同一账号在接口文档登录并授权，再执行GET `/palirov1/paliro/me/profile`，应看到最新值。自选照片不出现在接口响应中。

本轮文件清单（相对于工作区）：

| 文件 | 作用 |
| --- | --- |
| `ParamoboaxsDak/src/PaliroEntryApp.vue` | 资料GET/PATCH、加载及防重、缓存提示、失败保留草稿、401重新登录、照片本地保存 |
| `ParamoboaxsDak/src/services/paliroServerSession.js` | 使用私有会话凭证读取/更新本人资料，拦截过期和退出后的迟到响应 |
| `ParamoboaxsDak/src/services/paliroProfileSync.js` | 支持字段白名单、差异PATCH、服务器字段与本地照片合并 |
| `ParamoboaxsDak/src/services/paliroLocalStore.js` | 按服务端ID核对账号，更新资料缓存，保留其他本地字段和业务数据 |
| `ParamoboaxsDak/src/services/paliroI18n.js` | 英韩缓存提示及头像仅本地保存说明 |
| `ParamoboaxsDak/scripts/paliro-profile-sync.test.mjs` | 资料同步、隔离、晚到请求、断网、过期、防重和成功路径测试 |
| `ParamoboaxsDak/scripts/paliro-auth-browser.mjs` | 扩展真实页面编辑、相册头像、后台查询与失败重试验证 |
| `ParamoboaxsDak/PALIRO_AUTH_INTEGRATION.md`、`PaliroAccountServer/PALIRO_API.md` | 更新接口接入范围和协作规则 |
| `ParamoboaxsDak/dist/`及iOS `App/public` | 重新构建、同步HTML资源 |

## 本次文件与验证记录

以下路径相对于 `/Users/linqian/Documents/Palira`。既有前端页面和样式保留，不重做UI。

| 文件 | 本次作用 |
| --- | --- |
| `ParamoboaxsDak/src/PaliroEntryApp.vue` | 登录请求、注册内存草稿、最后一步提交、加载防重、启动验证、退出及路由准入 |
| `ParamoboaxsDak/src/services/paliroAccountApi.js` | 本地账号API、完整注册payload、超时/错误处理、安全凭证适配 |
| `ParamoboaxsDak/src/services/paliroServerSession.js` | 服务器认证后保存会话、恢复验证、过期/失败处理及登出 |
| `ParamoboaxsDak/src/services/paliroLocalStore.js` | 受控测试身份映射、普通账号UUID缓存、保留已有资料和业务数据 |
| `ParamoboaxsDak/src/services/paliroI18n.js` | 新增英文/韩文请求中及错误提示 |
| `ParamoboaxsDak/ios/App/App/PaliroBridgeViewController.swift` | 注册Keychain凭证读写插件 |
| `ParamoboaxsDak/package.json` | 修正build脚本，使iOS打包实际构建HTML |
| `ParamoboaxsDak/.env.example` | 本地API地址配置示例 |
| `ParamoboaxsDak/scripts/paliro-server-auth.test.mjs` | 认证、注册时机、数据隔离、密码迁移和失败路径回归测试 |
| `ParamoboaxsDak/scripts/paliro-auth-browser.mjs` | 真实Chrome登录注册、错误密码、旧消息、刷新、退出及小屏端到端测试 |
| `ParamoboaxsDak/PALIRO_AUTH_INTEGRATION.md` | App启动、数据边界、测试及本文件清单 |
| `ParamoboaxsDak/dist/index.html`、`dist/assets/index-*.js` | 更新构建产物，替换旧哈希JS；同内容已复制至iOS工程的`App/public` |
| `PaliroAccountServer/src/paliroDatabase.ts` | 增量迁移mood、gender及受控测试身份字段 |
| `PaliroAccountServer/src/paliroTestAccount.ts` | 幂等预置指定测试账号，不覆盖已有资料 |
| `PaliroAccountServer/src/paliroServer.ts` | 启动预置账号并更新联调说明 |
| `PaliroAccountServer/src/paliroAccounts.ts` | 注册账号、完整资料、会话在同一事务写入，公开响应包含测试标记 |
| `PaliroAccountServer/src/paliroSchemas.ts` | 完整注册校验、状态/性别字段、登录密码校验 |
| `PaliroAccountServer/src/paliroApp.ts` | 登录及删除确认使用对应密码校验规则 |
| `PaliroAccountServer/test/paliroAccounts.test.ts` | 更新完整注册、资料及测试账号验证 |
| `PaliroAccountServer/scripts/paliroSmoke.mjs` | 完整资料的真实HTTP注册闭环测试 |
| `PaliroAccountServer/PALIRO_API.md` | 更新注册请求、响应、校验及测试账号契约 |
| `PaliroAccountServer/PALIRO_START_HERE.md` | 更新启动和App联调说明 |

首次接口接入验证：前端65项和后端20项自动化测试通过；真实HTTP闭环、Chrome页面注册/登录闭环通过；Vite与iOS模拟器工程编译通过。320px宽度下完成按钮可见可点击。未进行真机软件键盘或Keychain运行时验证；没有安装覆盖当前模拟器里的App，请在Xcode重新运行以加载同步后的资源及原生插件。

### 测试密码更新为67896789

本次更改文件及目的：

| 文件（相对于工作区） | 作用 |
| --- | --- |
| `PaliroAccountServer/src/paliroTestAccount.ts` | 新预置密码；已有测试账号仅更新密码哈希并撤销旧会话，不重建账号 |
| `PaliroAccountServer/test/paliroAccounts.test.ts` | 验证新旧密码、保留资料、其他账号隔离、重复启动不撤销新会话 |
| `PaliroAccountServer/PALIRO_API.md`、`PaliroAccountServer/PALIRO_START_HERE.md` | 同步新密码及已有账号升级说明 |
| `ParamoboaxsDak/src/services/paliroLocalStore.js` | 本地测试配置和旧本地密码同步；服务器账号不重新写入明文密码 |
| `ParamoboaxsDak/scripts/paliro-server-auth.test.mjs` | 本地密码升级及资料不重置测试 |
| `ParamoboaxsDak/scripts/paliro-box-publishing.test.mjs` | 发布数据回归测试使用新密码 |
| `ParamoboaxsDak/scripts/paliro-auth-browser.mjs` | 浏览器登录测试改用新密码 |
| `ParamoboaxsDak/PALIRO_AUTH_INTEGRATION.md` | 同步账号说明和本记录 |
| `ParamoboaxsDak/dist/index.html`、`dist/assets/index-*.js`及iOS `App/public` | 重新构建和同步HTML资源 |

密码更新验证：前端66项、后端21项通过；已重启本地服务，真实HTTP验证新密码200、旧密码401，测试身份ID不变。没有修改UI、SafeArea或键盘处理；本次未重复进行设备UI测试。
