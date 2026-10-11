# 页面和功能实现

更新：2026-10-11。源码入口 src/main.tsx → src/App.tsx；页面使用 React Router 懒加载，Suspense 显示 Spin。

## 路由和身份

| 路由 | 组件 | 身份/用途 |
|---|---|---|
| / | Login.tsx | 公开；学生/教师选项 |
| /register | Register.tsx | 公开；学生/教师注册 |
| /profile | pages/Profile.tsx | 已登录；个人资料、安全、头像 |
| /knowledge | pages/KnowledgeBase.tsx | 已登录；可下载资料 |
| /projects/market | pages/ProjectMarket.tsx | student；项目详情和报名 |
| /projects/applications | pages/MyApplications.tsx | student；申请及审核结果 |
| /projects/manage | pages/ProjectManagement.tsx | teacher/admin；项目和申请管理 |
| /admin/login | pages/admin/AdminLogin.tsx | 独立管理员登录 |
| /admin | pages/admin/AdminDashboard.tsx | admin；统计 |
| /admin/users | pages/admin/AdminUsers.tsx | admin；用户管理 |
| /admin/events | pages/admin/AdminEvents.tsx | admin；全站项目 |
| /admin/applications | pages/admin/AdminApplications.tsx | admin；全站申请 |
| /admin/files | pages/admin/AdminFiles.tsx | admin；文件管理 |
| /admin/templates | pages/admin/AdminTemplates.tsx | admin；资料管理 |

RequireRole 请求 `/api/user/me/profile/` 获取当前会话 role；加载时 Spin，无权限跳转个人中心（当前 admin 则后台）；会话检查失败 Alert。它负责页面可见性，后端仍需校验每个 API。

MainLayout 按当前 role 构造菜单；学生看到项目广场/我的申请，教师看到项目管理，admin 才显示后台。AdminLayout 提供后台导航/退出。普通登录页已移除“管理员入口”，管理员收藏 `/admin/login`。隐藏链接不能代替后台鉴权。

服务器明确授权的基础 admin 可选学生、教师、管理员身份；首页传 role，管理员入口设置 admin。普通注册和资料表单不能开启多身份。同一浏览器共享会话，换身份要退出重新登录。

## 登录与注册

Login 使用 AppForm 提交 student_id/password/role 到 `/api/user/login/`，成功进入个人中心；AdminLogin 提交 `/api/admin/login/`，成功进入后台。错误由 handleApiError 展示，不能错误后仍显示成功。

Register 输入学号/工号、姓名、邮箱、密码确认、验证码、可选联系方式/部门以及 student/teacher 角色。先 `/api/user/send-register-code/`，再 `/api/user/register/`。验证码 5 分钟、一次使用，由服务器消费；公开注册没有管理员选项，教师目前无身份人工审核。

## 个人中心

Profile 挂载时 GET profile；PATCH 保存 name/class_name/phone/wechat_id/bio。只读学号与角色来自服务器，邮箱不能通过资料 PATCH 改。

上传头像 PUT `/api/user/me/avatar/`，FormData avatar。页面限制 JPEG/PNG/WebP、5 MiB，后端进一步 ImageField 验证；成功刷新头像和资料。头像 URL 是公开资源。

邮箱弹窗先 `/api/user/send-change-email-code/`，再 `/api/user/change-email/`，输入 email/code；密码弹窗提交 `/api/user/change-password/` 的 old_password/new_password/new_password_confirm。页面只描述邮箱用于注册和邮箱变更验证码，没有密码找回入口。

## 学生项目广场和申请

ProjectMarket 用 fetchAllPages 获取 `/api/event/events/`，支持当前页面的教师/状态/招募筛选，详情按 id 读取。表格和详情展示时间、人数、状态、说明及附件，附件使用 file_url 下载。

报名弹窗提交 `/api/event/events/<id>/apply/`。陈述在页面必填（API 允许空），简历可选。ResumeUploader 先上传 application_resume，支持 PDF/Word/ZIP、20 MiB，返回 UUID 放 resume_id。上传期间禁提交/取消/遮罩关闭/ESC，完成后才允许提交；失败提示并恢复操作。

published 和 ongoing 可申请，容量/重复/身份由服务器最终判断。当前 can_recruit=true API 筛选只含未开始项目，因此筛选结果不等于所有可中途报名项目；维护时需关注该现有差异。

MyApplications 用 fetchAllPages 获取本人申请，按状态组织列表，详情包含陈述、简历、审核意见和时间。无撤回按钮或撤回 API；cancelled 类型保留不代表功能已实现。

## 教师项目管理

ProjectManagement 使用 teacher/events 和 teacher/applications，完整分页读取后组织项目和申请。创建/编辑字段为标题、类型、地点、说明、时间、容量、附件；后端决定草稿/发布/关闭状态。

UploadField 上传 event_attachment，最大 100 MiB；返回 attachment_id。上传期间保存/取消/关闭被禁用。教师可编辑未关闭项目、删除草稿、发布草稿、开始前关闭已发布项目。页面按钮使用 can_* 和 status；服务器执行规则并返回错误。

申请管理可查看学生资料、陈述、受保护简历，并逐条 approve/reject。published 阶段可以改判；ongoing 只对 pending 启用审核按钮，已完成决定保持不变。审核后刷新项目人数和申请列表。没有批量审批。

## 知识库和资料管理

KnowledgeBase 与 AdminTemplates 共用 components/common/TemplateLibrary.tsx，分别加载 `/api/file/templates/` 和 `/api/file/admin/templates/`。

普通页面仅展示启用资料并用 file_url 下载。管理员可创建 key/name/description/is_active，上传 template 文件（PDF/Word/ZIP，20 MiB）后用 file_id 发布；可编辑、替换、停用、重新启用。key 为唯一 slug，编辑时应保持地址和键一致。

上传期间 modal 提交/取消/关闭禁用；saving 时显示提交进度。DELETE 为软停用，200 返回模板对象；停用不会移除磁盘文件和记录，恢复走编辑发布。它是文件资料库，无文章编辑或全文搜索。

## 管理员各页面

| 页面 | API 与关键行为 |
|---|---|
| AdminDashboard | GET admin/dashboard，展示基础角色分布、项目运行状态、申请状态、文件统计 |
| AdminUsers | 服务端分页 role/search；create/update/delete；修改编号、角色、资料、is_active、可选重置密码；留空密码不改，非空至少 6 字符 |
| AdminEvents | 服务端分页 status/search/teacher_name；创建、编辑、发布、关闭、删除；teacher_id 指定发布者，关闭项目不能编辑 |
| AdminApplications | 服务端分页 event/status；详情、简历和审核意见；approve/reject 与教师共用后端审批规则 |
| AdminFiles | 服务端分页 category/search；展示文件元数据、下载和删除；引用中文件不可删 |
| AdminTemplates | 共用 TemplateLibrary 管理资料发布和停用 |

用户删除会级联业务数据，教师删除会删除其项目及申请；学生删除会释放其已通过名额。管理员项目删除不限草稿，管理员可强制关闭；这些权限不同于教师页。操作确认框必须反映真实后果，不能当作软删除。不能删除自己或修改自己基础角色，后端拒绝。

当前 AdminEvents 附件使用 UUID 字段，并没有教师页相同的嵌入式上传器；上传可先走相应文件 API，再填 attachment_id。不应把教师附件上传保护描述为管理员项目表单也有同款上传器。

## 尚未实现

通知 API 已存在但没有通知页/铃铛；没有忘记密码、申请撤回、知识库文章/全文搜索；教师注册无人工审核。没有前端自动化端到端测试套件或所有设备的长期覆盖。修改这些功能时应同时补对应后端规则和文档。
