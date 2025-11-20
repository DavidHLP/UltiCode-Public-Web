# Repository Guidelines

## 项目结构与模块组织
- 前端基于 Vite + Vue 3 + TypeScript，入口在 `src/main.ts`，全局样式 `src/style.css`。
- 页面与布局：`src/layout` 存放全局框架，`src/view` 下按功能域（如 contest/problems/forum）组织页面级组件。
- 可复用组件：`src/components`（UI 子目录提供基础组件，code 目录存放编辑器相关组件）；图标和静态资源位于 `src/ico`、`src/assets`。
- 路由配置在 `src/router`；业务 API 封装在 `src/api`。
- Mock 与数据校验：`src/mocks` 维护 MSW 处理器、schema、样例数据；执行前请保证模拟数据通过校验。
- 公共静态文件在 `public/`；脚本工具位于 `scripts/`；构建配置在 `vite.config.ts`，TypeScript 配置见 `tsconfig*.json`。

## Mock 数据与数据一致性
- `src/mocks/schema.sql` 定义了 mock 数据库的表结构及主外键约束；`src/mocks/db` 与 `src/api` 的数据接口需要与该 schema 对齐，保持字段含义一致。
- 添加/调整 mock 时，请先对照 schema 确认主键唯一、外键引用存在且有业务意义，避免孤儿记录或不合理枚举。
- 可以重构 mock 目录结构或数据生成方式，但必须更新相关处理器与校验逻辑，确保 `validate:mocks:*` 全部通过。
- API mock 响应应贴近真实场景（成功/异常分支），示例数据需可用于前端页面演示与测试。

## 开发、构建与本地运行
```bash
npm install           # 安装依赖（Node 20.19+ 或 22.12+）
npm run dev          # 启动本地开发（含 HMR）
npm run build        # 类型检查 + 生产构建
npm run preview      # 以本地服务器预览构建产物
npm run lint         # ESLint 检查并自动修复
npm run format       # 使用 Prettier 格式化 src/
npm run test         # 运行 Vitest（无 watch）
npm run test:watch   # Vitest watch 模式
npm run test:coverage# 生成覆盖率
npm run validate:mocks[:verbose|:strict] # 校验 mock 数据
```

## 代码风格与命名约定
- 使用 Prettier + ESLint（Vue/TS 规则），默认 2 空格缩进；提交前建议运行 `npm run lint` 与 `npm run format`。
- Vue 组件与 TypeScript 文件采用 PascalCase，如 `ContestHealthPanel.vue`；资源文件与样式建议使用 kebab-case。
- 组合式函数/Hook 以 `useXxx` 命名，Pinia store 以业务域命名；常量使用 SCREAMING_SNAKE_CASE，内部工具函数使用 camelCase。
- 导入顺序：先外部依赖，再别名/本地模块，再样式；保持相对路径简洁。

## 测试指南
- 测试框架为 Vitest（jsdom 环境），建议临近被测模块创建 `*.spec.ts`/`*.test.ts`。
- 覆盖主要分支逻辑；新增组件应至少覆盖渲染与关键交互，API 封装需覆盖异常分支。
- 需要网络/接口数据时优先使用 MSW mock；如涉及复杂数据结构，可参考 `src/mocks/schema` 并复用现有样例。
- 提交前至少运行 `npm run test`，变更 API 或数据模型时请追加 `npm run validate:mocks:strict`。

## 提交与 Pull Request
- Git 历史采用 Conventional Commits 样式（示例：`chore: 更新 .gitignore 文件`、`refactor(mock): 重构竞赛数据结构与API实现`）；请带上明确 scope。
- PR 说明需包含：变更摘要、关联 issue/需求、测试结果（命令输出简述）、如涉及 UI 请附截图或录屏。
- 界面或交互变更需说明影响范围与回滚方式；新增依赖请解释原因与安全考量。
