# AGENTS.md

## 📌 项目开发规范与技术指南 (Project Development Specification)

本文件是 Muzoi 的核心开发规范指南。Codex 在执行任何代码修改、UI 还原、逻辑重构或功能迭代时，必须严格遵守本指南，以确保包的代码特征与 App Store 审核规范完全合规。


## ⚙️ 1. App 基础信息 (App Identity)
* **App ID：80962768
* **App 标题：Paliro：Mystery Box，Meet People
* **App 副标题：
* **蓝湖设计链接： https://lanhuapp.com/web/#/item/project/stage?pid=5e08252d-4a6c-4cd9-a6ad-a1d0aa58994d&tid=8c379c32-0bd6-44ae-ab3b-cfb09ffccdbf


* **App Store 描述：
Every box you open could lead to an unexpected connection.
Pandora Box is a social discovery app built around mystery, curiosity, and meaningful moments. Create a box filled with your current mood, thoughts, or conversation topics—or open someone else’s box and discover the story waiting inside.
【Create Your Own Box】
Choose a theme, share what is on your mind, and create a Pandora Box that reflects who you are.
【Discover Hidden Surprises】
Every box holds something different. Open one and enjoy the excitement of discovering the unknown.
【Express Your Mood】
Whether you feel happy, lonely, playful, or simply want to chat, Pandora Box gives you an easy way to express yourself.
【Meet Interesting People】
Discover boxes created by others, find people who share your interests, and let every connection begin with curiosity.
【Unlock More Boxes】
The basic experience is free. Optional in-app purchases allow you to open more Pandora Boxes or create additional boxes of your own. Prices and purchase details are clearly displayed in the app.
Open Pandora Box and turn every moment of curiosity into a new connection.

## 🎯 3. App 定位与边界限制 (App Positioning)

* **项目属性：** 本项目是一个基于 Vue搭建的Html项目，要求打包后用ios工程，用webview加载Html，必须适配ios界面。
* **开发核心约束：** Codex 在修改本项目时，必须始终围绕 **App 标题**、**App 描述**、**蓝湖设计图**和**命名词汇范围**进行开发，禁止引入任何与多语言交流、语言学习及异国文化交友主题无关的功能、文案、命名或 UI 元素。
* **冲突解决优先级：** 如果设计图、App 描述、现有代码之间存在冲突，严格遵循以下优先级：
1. **蓝湖设计图**
2. **App 标题和 App 描述**
3. **本文件 AGENTS.md**
4. **现有代码实现**


* **不确定业务处理：** 如遇到不确定的业务含义，优先根据 App 描述进行判断，**严禁自行扩展无关功能**。



## 🎨 5. UI & UX 整体适配要求 (UI Standards)

* **设计还原度：** 必须严格参考蓝湖设计图还原页面，不得为了图省事擅自更改布局、删减图层或替换核心组件。
* **视觉一致性：** 维持整体视觉规范，禁止私自更换主色调、字体家族、圆角阶梯以及按钮样式。
* **跨机型屏幕适配：** 界面必须完美适配大至 iPhone Pro Max、小至 SE 的各类尺寸屏幕。
* **安全区域约束 (SafeArea)：** 顶部布局必须动态避开刘海、灵动岛、系统状态栏；底部布局必须完整避开 Home Indicator 边缘。
* **键盘交互拦截：** 严禁出现键盘弹出时输入框或核心动作按钮被遮挡的体验问题。内容较多时必须支持滑动（ScrollView），且点击空白处能自动收起键盘。
* **控制台警报控制：** 修改或调试后，Xcode 控制台绝不能高频抛出 `overflow`、`constraint conflict`（约束冲突）或严重的渲染布局错误。

---

## 🔐 6. 登录注册与本地数据闭环规则 

本项目登录注册模块采用**本地状态闭环方案**。

### 6.1 固定测试账号
账号：paliro@gmail.com    密码：678678

### 6.2 欢迎页面与合规 EULA 规则

1. **首次激活冷启动：** 用户首次进入欢迎页时，必须自动弹出专门 **EULA（最终用户许可协议）**。
2. **EULA 文案核心要求：** **
elua内容需要结合app描述和apple审核规则生成。协议中必须明文包含：**用户行为规范、账号注册门槛、年龄与本地身份合法性检查、举报与拉黑机制、严厉的内容审查和违规惩罚条例。
3. **状态绑定：** 用户点击“Agree（同意）”后，立刻将同意状态写入本地。同时，欢迎页底部的“已阅读并同意”复选框必须自动同步勾选。用户在界面上手动勾选/取消，也必须双向绑定至这一本地持久化键值中。
4. **条款跳转：** 欢迎页底部的“隐私政策（Privacy Policy）”与“用户条款（Terms of Service）”按钮必须保证可用，点击后能够平滑跳转至对应的路由页面。

### 6.3 登录流程与逻辑分支

1. 用户在 UI 交互层输入 `email` 和 `password`。
2. 客户端非空校验：若为空，给出相应的提示，且中断后续逻辑。
3.登录接口请求。登录成功后，从模拟响应字典中解析并保存 `userID`、`Token` 等基础凭证，准入。
4.登陆页面的登陆按钮下方添加提示文案：如果账号不存在，将为您自动创建 的英文文案


5. **登录成功：** 状态机变更，保存登录态及用户信息，紧接着平滑切换或推入 App 的主 Tab 主页面。


### 6.5 个人中心展示与登出

* **读取规则：** 个人中心、我的页面、详情资料卡等区域，**必须绝对优先**读取本地当前登录的用户数据。若沙盒内暂无该字段数据，必须使用兜底的默认占位符或默认头像，**严禁发生致命崩溃（Crash）**。
* **退出登录规则：** 点击退出登录后，**仅清除**当前的登录状态标识位（如将 `muzoiLoggedIn` 设为 `false`），**绝对禁止删除或抹除**本地已经注册的其他用户数据。


## 📱 7. UIKit 项目特别要求 (UIKit Special Demands)

由于本项目采用 UIKit 编写，Codex 必须追加遵守以下技术底线：

* **视图约束：** 视图层级严禁死写坐标轴。必须全部使用 `safeAreaLayoutGuide` 锚点和 Auto Layout 自动布局进行相对约束。
* **键盘通知监听：** 必须注册并处理 `keyboardWillShow` 与 `keyboardWillHide` 通知，动态计算 `UIKeyboardFrameEndUserInfoKey`，平滑抬高输入容器。
* **滚动轴边距更新：** 键盘推起或拉回时，需配合正确修正 `scrollView.contentInset` 和 `scrollIndicatorInsets` 的边距，保证滚动通畅。
* **持久化选型：** 本地数据存储必须优先沿用项目中现有的持久化工具类。若原项目无现成方案，方可使用标准 `UserDefaults` 或者是等价的安全沙盒方案。

---

## 🚫 8. 核心禁止事项 (Strictly Prohibited)

* **禁止硬接真实服务器：** 绝对不要直接去对接真实的商业化线上后端，也不允许去接入 Firebase、Supabase 或其他的云数据库，除非得到明确指示。
* **禁止删除核心页面：** 严禁直接破坏、重命名或剔除现有的核心业务页面与网络拦截器链路。
* **禁止文本交叉污染：** 严禁直接复制其他毫不相干应用的标题、描述、内购关键词、协议条款或页面名字过来。
* **禁止不完整的 UI 还原：** 绝不能仅仅做个好看的 UI 壳子，而不去实现本地数据的读写逻辑闭环。
* **禁止硬编码适配：** 严禁使用大量写死尺寸（如固定宽高、硬编码固定偏移量）导致的小屏设备适配失败。

---

## 🔐 9. 主模块的二级界面

进入所有二级界面需要隐藏底部的tabbar，返回一级界面再显示tabbar 
## 🔄 9. 任务执行与回复规范 (Workflow & Reply Template)

### 9.1 开始前的强制前置检查

Codex 每次接手并开始动手修改代码前，必须先按顺序自检以下 5 项：

1. 是否已通读并完全理解本 `AGENTS.md` 的全部规则？
2. 是否已对齐  标题、描述以及其专属命名词汇范围？
3. 即将编写的功能是否契合app的主题？
4. 当前修改会不会对登录注册流程、本地用户数据落盘或个人中心读取造成破坏？
5. 当前编写的 UI 约束是否完美覆盖了 SafeArea、键盘遮挡和大/小屏 iPhone 适配？

### 9.2 修改完成后的结构化回复要求

每次代码修改、逻辑微调或页面提交完成后，Codex 必须在回复的最上方，严格依照以下**标准结构体**进行详细汇报汇报：

```markdown
### 📢 任务修改执行报告

1. **修改了哪些文件：** (请详细列出受影响的文件相对路径)
2. **每个文件解决了什么问题：** (请简要说明修改的目的与修复的缺陷)
3. **是否影响登录注册流程：** (是/否，并说明影响范围)
4. **是否影响本地用户数据：** (是/否，是否破坏了本地持久化闭环)
5. **是否检查了 iOS 适配和键盘交互：** (请确认大小屏、SafeArea 及键盘遮挡自检结果)
6. **如何测试本次修改：** (请给出具体的黑盒/白盒测试步骤，以便开发者快速验证)

```

## 🔤 4. 命名词汇范围与规范 (Naming Vocabulary & Standards)

### 4.1 语义合规要求


* **保持命名纯净：** 杜绝残留或混用其他模板项目的异形名称、业务词或文案样式。所有英文文案应做到自然、地道、简洁。

### 4.2 文件、类名与组件规范

* **文件和目录：** 文件名必须清晰表达功能，且必须加上特定的**项目特色前缀**，拉开特征，防止大范围代码雷同。
* **类与类组件：** 类名、组件名采用“业务前缀 + 业务清晰含义名”组合。严禁使用无意义命名

---


### 4.3 专属命名词汇池：

