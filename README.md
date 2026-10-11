# 自强科协网站前端

React 19 + TypeScript + Vite + Ant Design，连接真实 Django API。后端：[ZiqiangBackend](https://github.com/zhihong-YU/ZiqiangBackend)。正式网站：https://ziqiangkexie.cn/，管理员独立入口 `/admin/login`。

## 接手维护

| 文档 | 内容 |
|---|---|
| [各页面与功能实现](docs/features.md) | 路由、身份、页面/API、上传和业务流程 |
| [开发与发布](docs/development.md) | 组件、请求封装、错误、分页、本地启动、验证和发布 |
| [API 对接入口](frontend-api.md) | 后端完整接口契约和两端文档对应关系 |
| [更新记录](CHANGELOG.md) | 已完成变更及验证 |
| [维护约定](AGENTS.md) | 每次修改同步文档与 GitHub |

当前协作/发布代码分支 `yzh24`，本次推送不会自动合并到 `main`。后端功能规则、数据模型、运维、联调报告在后端仓库 docs/ 与 qa/。

## 本地运行

Node ^22.12.0 或 >=24.0.0。先启动后端 127.0.0.1:8000，再运行：

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Vite 页面通常在 5173。后端本地 CSRF 信任地址要包含实际 Vite Origin。生产是同域静态站点，不运行 Vite dev server。

```sh
npm run build
npm run lint
```

build 执行 TypeScript 检查后生成 dist。dist、node_modules、环境/凭据不提交。依赖变更必须同步 package-lock.json，维护文档需与同次代码提交一起推送。
