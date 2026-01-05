# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

基于 Tauri v2 的图片压缩桌面应用。前端使用 React 19，后端使用 Rust。

## 开发命令

```bash
# 启动开发环境（前端 + 后端热重载）
pnpm start

# 构建
pnpm build:debug        # 调试构建
pnpm build:release      # 生产构建

# 仅前端
pnpm vite:dev           # Vite 开发服务器
pnpm vite:build         # 构建前端

# 工具
pnpm output:icon        # 生成应用图标
```

## 项目架构

```
├── src/                    # 前端 (React/TypeScript)
│   ├── pages/              # 路由页面 (compress, splash, demo)
│   ├── router/             # React Router 配置
│   ├── layout/             # 布局组件
│   ├── utils/              # 工具函数 (file, update, window)
│   └── typings/            # TypeScript 类型定义
│
└── src-tauri/              # 后端 (Rust)
    └── src/
        ├── compress/       # 图片压缩逻辑
        │   └── index.rs    # ImageCompression 结构体
        ├── window/         # 窗口管理
        │   ├── setup.rs    # 应用初始化
        │   ├── command/    # Tauri 命令 (drag, splash, js2rs)
        │   ├── event/      # 事件处理器
        │   ├── menu/       # 菜单配置
        │   └── tray/       # 系统托盘
        ├── shared/         # 全局状态、错误类型
        └── utils/          # 日志、调试、线程池
```

## 主要 Tauri 命令

通过 `@tauri-apps/api` 暴露给前端的命令：
- `close_splashscreen` - 关闭启动画面并显示主窗口
- `get_drag_files` - 获取拖放的文件
- `start_compress` - 开始图片压缩
- `js2rs` - 通用的 JS 到 Rust 通信

## 技术栈

**前端：** React 19, React Router 7, TailwindCSS 4, Vite 7, TypeScript 5.9, ahooks

**后端：** Tauri 2, Tokio, serde, infer (MIME 检测), globset/walkdir, tracing

**Tauri 插件：** fs, clipboard-manager, notification, global-shortcut, updater, opener, os

## 代码风格

**前端 (Prettier)：**
- 不使用分号
- 双引号（JSX 中使用单引号）
- 160 字符行宽
- 尾随逗号

**后端 (rustfmt)：**
- 120 字符最大行宽
- 4 空格缩进

## 支持的图片格式

PNG, JPEG, GIF, WebP
