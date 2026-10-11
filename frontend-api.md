# 前端 API 对接与维护入口

更新：2026-10-11。

完整且按实际源码核对的接口方法、字段、响应、分页及权限，维护在后端 [docs/api.md](https://github.com/honghuwu/ZiqiangBackend/blob/master/docs/api.md)。业务规则见后端 [docs/features.md](https://github.com/honghuwu/ZiqiangBackend/blob/master/docs/features.md)。本仓库对应页面与调用链见 [docs/features.md](docs/features.md)，公共请求和本地调试见 [docs/development.md](docs/development.md)。

## 关键对接约定

- 使用相对 /api/ 路径，Session Cookie，不使用本地 JWT 或模拟账号拦截。
- 所有写请求经 src/utils/apiFetch.ts 获取最新 JSON csrfToken 并带 X-CSRFToken；登录也受保护。管理员 `/admin/login` 使用 `/api/admin/login/`。
- 列表支持分页 results/next；默认 20、page_size 上限 100。fetchAllPages 用于完整集合页面，管理列表保留服务端分页。
- 文件先上传获取 UUID，再提交 attachment_id/resume_id/file_id。下载使用后端 file_url，不拼接私有 media 路径。
- 管理员资料管理真实地址为 `/api/file/admin/templates/`；DELETE 停用返回 200 和对象，可以重新启用。
- 项目进行中允许报名，新的 pending 可以审核，已完成决定不可改；pending 不占名额。
- 普通登录页只提供学生/教师入口，不展示管理员链接。普通账号不能跨身份；已授权 Leader 多身份由服务器 session 控制。
- 匿名 Session API 可能返回 403；AUTH_003 才表示应引导重新登录，其他 403 应展示权限/CSRF 问题。
- API 业务错误不一定返回专用 APP_*，serializer 常返回 VAL_008 及字段错误，不要按错误码表假设所有视图行为。

## 验证与现有限制

2026-10-11 独立学生/教师/管理员全流程报告：[后端 qa 报告](https://github.com/honghuwu/ZiqiangBackend/blob/master/qa/full-site-qa-20261011.md)。最终 PostgreSQL 90 项回归通过，前端 build/lint 通过；公网 174 条历史检查及复测留档。

通知页面、忘记密码、撤回申请、知识库文章编辑/全文搜索未实现。公开 can_recruit 筛选当前不包含进行中项目，虽然直接报名允许；教师自选注册没有人工身份审批。测试注册使用预置验证码，不代表新增测试邮箱实收邮件。ICP 状态未独立核验，运维当前访问状态见后端 deployment 文档。
