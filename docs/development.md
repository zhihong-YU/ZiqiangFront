# 前端开发与发布

更新：2026-10-11。

## 结构和组件

src/main.tsx 安装 setupApiFetch，挂载 BrowserRouter 和页面。App.tsx 懒加载各页面，权限封装 RequireRole。layouts/ 管理导航；pages/ 放业务；components/ui/ 封装 Ant Design 的表单、按钮、表格、弹窗等；components/common/ 放跨页面业务（资料库和权限）；utils/ 放请求与错误处理。@ 别名指向 src，见 vite.config.ts / tsconfig.json。

AppForm 接收 onFinishAsync，await 后按配置显示 successMessage；提交函数遇 API 错误应抛出或按页面策略处理，不能将失败视为正常完成。它不自动为所有页面提供防重复提交锁，复杂上传/保存需页面自己控制。Button 当前只是 Ant Design Button 的透传封装，本身不自动防重复点击；页面必须显式控制 loading/disabled。

## 请求、CSRF 与错误

setupApiFetch 包装 window.fetch，仅处理同源 /api/ 请求。外域请求不附会话 token。写请求先获取 JSON csrfToken，设置 X-CSRFToken 和 credentials:include；不手动读取 HttpOnly Cookie。登录轮换 token，因此每次写请求获取最新值。

401/403 时查看 cloned JSON；AUTH_003 才重定向到当前门户登录页。其他拒绝由页面 handleApiError 展示，不能将普通业务 403 都当成登录过期。JSON 响应先判断 response.ok，字段级错误和未知 detail 都需要可读提示。

handleApiError 按 error_code/HTTP/detail 提示并支持导航注入。后端存在专用业务码及 VAL_008，别只依赖 APP_* 常量。204 删除没有 JSON body；模板停用及管理员项目删除为 200 有 body。

文件用 FormData，不手工设置 Content-Type。下载用服务器返回的相对 file_url，保留浏览器 Cookie。私有 media 直链故意不可用。

## 分页与状态

normalizeList 兼容数组或 results；fetchAllPages 沿 next 读取，强制同域 /api/ 且 page_size=100，防止 token 跟随外域分页地址。当前它将所有页积累到内存，数据增大应转服务器筛选/分页而不是继续扩大全量拉取。

普通项目、本人申请、教师管理及资料库按完整集合读取；管理员用户/项目/申请/文件使用 count/page/page_size 服务端分页。过滤后重置页码，CRUD 后刷新列表，避免停留无数据的旧页。

类型定义目前分散在页面；改接口字段时核对所有调用页面及嵌套文件对象，不能只改一处。项目 status=ongoing/closed 有运行时计算语义，capacity/approved 计数以服务器为准。

## 开发验证

```sh
npm ci
npm run dev -- --host 127.0.0.1
npm run build
npm run lint
```

build 包含 tsc --noEmit。npm ci 使用提交的 lockfile；修改依赖需要同步 package.json/lockfile。后端本地运行 8000，Vite 代理 /api 与 /media/avatars/，后端配置本地 CSRF Origin。不要将 DEBUG/测试账号开关带入生产。

页面验收重点：角色菜单与直达路由；成功与错误表单；分页超过 20 条；大文件上传禁提交；进行中 pending 审核；停用资料不展示；刷新深层路由；关闭项目不可编辑。后端行锁/验证码消费通过 PostgreSQL 测试验证，页面按钮禁用不能替代它。

2026-10-11 build/lint 通过，真实网页三角色联调与限制见后端 qa 报告。仓库目前没有浏览器自动化测试脚本，不能把构建通过说成全部页面已测试。

## GitHub 和文档维护

每个完成改动都应更新涉及的功能/API/部署文档及 CHANGELOG，验证后 commit + push 当前 main；后端涉及变更另在后端仓库提交。检查远端差异并正常快进/按需解决冲突，不 force push。交付写出提交 SHA 和验证结果。yzh24 已合入 main；后续其他协作分支的推送不会自动合入 main，需要明确完成合并并验证。

禁止提交凭据、会话、真实个人数据、.env、node_modules 和 dist。功能记录应包含页面路由、角色、API、输入/响应、状态规则、代码位置、错误和未实现边界。

## 生产发布与回滚

当前 Nginx root `/opt/ZQfrontend/dist`，/api/ 转 Gunicorn，前端路由 try_files 回退 index.html。提交推送并 build 成功后部署 dist；前端静态更新通常不需重启后端。

发布前保存旧 dist 和两端 SHA，保留旧 hashed 资源供已打开页面加载。上传新资产后切换 index，或使用发布目录原子切换（当前尚未实施版本目录）；路径权限 root 所有、目录 755/文件 644。macOS openrsync 可用 --chmod=u=rwX,go=rX，勿复制本机 700 权限。

验证首页、/admin/login、深层路由刷新、真实 API 和所改角色页面。回滚恢复旧 index 与匹配资源，涉及后端契约变化应一起回滚/兼容；只恢复前端无法撤销后端数据迁移。详细运维、备份及 HTTPS 在后端 docs/deployment.md。
