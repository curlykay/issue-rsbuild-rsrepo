# Rsbuild Monorepo HMR Issue Reproduction

## 问题描述

在 monorepo 环境中，使用 Turbo Watch 功能监听依赖库的变化并自动构建时，**Rsbuild** 的 HMR 表现异常，而 **Vite** 表现正常。

### Rsbuild 环境测试结果

- ✅ **lib-tsup**（tsup 构建）：修改源码后，HMR 正常工作
- ❌ **lib-rslib**（rslib 构建）：修改源码后，HMR 报错 `Module not found: Can't resolve 'lib-rslib'`
- ❌ **lib-tsdown**（tsdown 构建）：修改源码后，HMR 报错与 lib-rslib 一致

### Vite 环境测试结果（对比）

- ✅ **lib-tsup**：修改源码后，HMR 正常工作
- ✅ **lib-rslib**：修改源码后，HMR 正常工作
- ✅ **lib-tsdown**：修改源码后，HMR 正常工作

**结论**：同样的 monorepo 配置和依赖构建流程，Vite 环境下所有依赖库的 HMR 均正常。

Rsbuild 错误示例：

```
playground-rsbuild-ts:dev: start   building removed lib-rslib/dist/index.js
playground-rsbuild-ts:dev: error   Build error:
playground-rsbuild-ts:dev: File: ./src/index.ts:1:1
playground-rsbuild-ts:dev:   × Module not found: Can't resolve 'lib-rslib' in
'/Users/ck/Space/fiddle/rsrepo/packages/playground-rsbuild-ts/src'
playground-rsbuild-ts:dev:     ╭─[10:9]
playground-rsbuild-ts:dev:   8 │   <div class="content">
playground-rsbuild-ts:dev:   9 │
playground-rsbuild-ts:dev:  10 │     <p>${getLibRsLib()}</p>
playground-rsbuild-ts:dev:     ·          ───────────
playground-rsbuild-ts:dev:  11 │     <p>${getLibTsdown()}</p>
playground-rsbuild-ts:dev:  12 │     <p>${getLibTsup()}</p>
playground-rsbuild-ts:dev:     ╰────
playground-rsbuild-ts:dev:
```

虽然在 playground-rsbuild-ts/src/index.ts 中触发一次保存可以恢复，但开发体验很差。

## 项目结构

```
rsrepo/
├── packages/
│   ├── lib-rslib/              # 由 pnpm create rslib 创建
│   ├── lib-tsdown/             # 由 pnpm create tsdown 创建
│   ├── lib-tsup/               # 由 pnpm create tsup 创建
│   ├── playground-rsbuild-ts/  # 由 pnpm create rsbuild 创建 (Vanilla + TypeScript)
│   └── playground-vite-ts/     # 由 pnpm create vite 创建 (Vanilla + TypeScript)
```

## 快速开始

### 1. 安装依赖并初始化

```bash
pnpm run setup
```

该命令会执行：

- 安装所有依赖
- 启动 Turbo daemon
- 构建所有 packages

### 2. 启动开发服务

#### 测试 Rsbuild（有问题）

```bash
pnpm run prt:dev-watch
```

#### 测试 Vite（正常）

```bash
pnpm run pvt:dev-watch
```

两个命令都依赖 Turborepo 的 `turbo watch` 功能：

- 启动对应的 playground 开发服务器
- 监听依赖库源码的修改
- 根据依赖拓扑从修改处向下游依次自动构建

## 复现步骤

### 在 Rsbuild 环境测试（playground-rsbuild-ts）

运行 `pnpm run prt:dev-watch` 后：

#### 测试 lib-tsup（正常工作）

1. 浏览器访问 playground-rsbuild-ts
2. 修改 `packages/lib-tsup/src/index.ts` 中的代码
3. ✅ lib-tsup 自动重新构建
4. ✅ playground-rsbuild-ts HMR 正常更新
5. ✅ 页面内容正确刷新，无 error mask 弹出

#### 测试 lib-rslib（出现问题）

1. 浏览器访问 playground-rsbuild-ts
2. 修改 `packages/lib-rslib/src/index.ts` 中的代码
3. ✅ lib-rslib 自动重新构建
4. ❌ playground-rsbuild-ts HMR 报错：`Module not found: Can't resolve 'lib-rslib'`
5. ❌ 页面弹出 error mask，开发流程被中断
6. ⚠️ 注意：第一次修改可能正常，第二次修改必然出错

#### 测试 lib-tsdown（出现问题）

1. 浏览器访问 playground-rsbuild-ts
2. 修改 `packages/lib-tsdown/src/index.ts` 中的代码
3. ✅ lib-tsdown 自动重新构建
4. ❌ playground-rsbuild-ts HMR 报错：与 lib-rslib 相同的错误
5. ❌ 页面弹出 error mask，开发流程被中断

### 在 Vite 环境测试（playground-vite-ts）

运行 `pnpm run pvt:dev-watch` 后：

#### 测试所有依赖库（全部正常）

1. 浏览器访问 playground-vite-ts
2. 分别修改 `packages/lib-tsup/src/index.ts`、`packages/lib-rslib/src/index.ts`、`packages/lib-tsdown/src/index.ts`
3. ✅ 依赖库自动重新构建
4. ✅ playground-vite-ts HMR 正常更新
5. ✅ 页面内容正确刷新，无 error mask 弹出

## 临时解决方案

当 Rsbuild 出现 HMR 错误时，在 `packages/playground-rsbuild-ts/src/index.ts` 中触发一次保存即可恢复。
