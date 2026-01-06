# AGENTS.md

本文件为 AI 编码代理（如 Claude、Cursor、Copilot）在此仓库中工作时提供指导。

## 项目概述

基于 Tauri v2 的图片压缩桌面应用。前端使用 React 19 + TypeScript，后端使用 Rust + Tokio。

**技术栈：**
- **前端：** React 19, React Router 7, TailwindCSS 4, Vite 7, TypeScript 5.9, ahooks
- **后端：** Tauri 2, Tokio, serde, infer, tracing, anyhow, thiserror
- **工具链：** pnpm 10.26.2, Rust 1.92.0, Cargo 1.92.0

---

## 构建与测试命令

### 前端命令
```bash
# 开发
pnpm vite:dev              # 启动 Vite 开发服务器（仅前端）
pnpm start                 # 启动完整开发环境（前端 + Rust 后端热重载）

# 构建
pnpm vite:build            # 构建前端（TypeScript 编译 + Vite 打包）

# 工具
pnpm output:icon           # 从 fire.png 生成应用图标
```

### 后端命令
```bash
cd src-tauri

# 开发与构建
cargo build                # 调试构建
cargo build --release      # 生产构建
pnpm build:debug           # Tauri 调试构建（包含前端）
pnpm build:release         # Tauri 生产构建（包含前端）

# 测试
cargo test                 # 运行所有测试
cargo test test_name       # 运行包含 test_name 的测试
cargo test -- --nocapture  # 显示测试输出

# 代码质量
cargo clippy               # 运行 Clippy linter
cargo clippy -- -D warnings # Clippy 视警告为错误
cargo fmt                  # 格式化代码
cargo fmt -- --check       # 检查格式（CI 用）
```

### 完整应用
```bash
pnpm start                 # 开发模式（热重载）
pnpm build:release         # 生产构建
```

---

## 项目架构

```
├── src/                          # 前端 (React/TypeScript)
│   ├── pages/                    # 路由页面
│   │   ├── compress/             # 主压缩页面
│   │   ├── splash/               # 启动画面
│   │   └── demo/                 # 演示页面
│   ├── router/                   # React Router 7 配置
│   ├── layout/                   # 布局组件
│   ├── components/               # UI 组件库
│   │   ├── ui/                   # 基础 UI 组件
│   │   └── icons/                # 图标组件
│   ├── utils/                    # 工具函数
│   │   ├── file.ts               # 文件处理（格式化大小、下载）
│   │   ├── update.ts             # 应用更新逻辑
│   │   └── window.ts             # 窗口管理
│   └── typings/                  # TypeScript 类型定义
│       └── compress.ts           # 压缩相关类型
│
└── src-tauri/                    # 后端 (Rust)
    └── src/
        ├── main.rs               # 应用入口
        ├── lib.rs                # 库入口
        ├── compress/             # 图片压缩核心
        │   ├── index.rs          # ImageCompression 结构体
        │   └── utils/            # 压缩工具（MIME、目录遍历）
        ├── window/               # 窗口管理
        │   ├── setup.rs          # 应用初始化
        │   ├── command/          # Tauri 命令
        │   │   ├── drag.rs       # 拖放文件处理
        │   │   ├── splash.rs     # 启动画面控制
        │   │   └── js2rs.rs      # JS-Rust 通信
        │   ├── event/            # 事件处理器
        │   ├── menu/             # 菜单配置
        │   └── tray/             # 系统托盘
        ├── shared/               # 共享模块
        │   ├── error.rs          # 自定义错误类型
        │   └── state.rs          # 全局状态
        └── utils/                # 工具模块
            ├── log.rs            # 日志配置
            ├── debug.rs          # 调试工具
            └── pool.rs           # 线程池
```

---

## 代码风格指南

### 前端 (TypeScript/React)

#### 格式化 (Prettier)
- **无分号**：`semi: false`
- **双引号**：字符串使用 `""`，JSX 属性使用 `''`
- **行宽**：160 字符
- **缩进**：2 空格
- **尾随逗号**：所有多行结构
- **换行符**：LF (`\n`)

#### 导入顺序
```typescript
// 1. React 核心
import { useEffect, useRef, useState } from "react"

// 2. 第三方库
import SimpleBar from "simplebar-react"
import "simplebar-react/dist/simplebar.min.css"

// 3. Tauri API
import { invoke } from "@tauri-apps/api/core"
import { getCurrentWindow, DragDropEvent } from "@tauri-apps/api/window"

// 4. 本地模块（使用 @/ 别名）
import { ImageCompreessInfo } from "@/typings/compress"
import { formartFileSize } from "@/utils/file"
import { Button, Card } from "@/components/ui"
```

#### TypeScript 约定
- **类型定义**：优先使用 `interface`，联合类型用 `type`
- **严格模式**：关闭（`strict: false`），但仍需显式类型注解
- **命名**：
  - 组件：PascalCase (`ImageCard`)
  - 函数/变量：camelCase (`formartFileSize`, `isHover`)
  - 类型/接口：PascalCase (`ImageCompreessInfo`)
  - 常量：camelCase 或 UPPER_SNAKE_CASE

#### React 模式
```typescript
// Hooks 顺序：useState → useRef → useEffect
const [list, setList] = useState<ImageCompreessInfo[]>([])
const unlistenRef = useRef<Promise<UnlistenFn>>(null)

useEffect(() => {
  // 清理函数
  return () => {
    unlistenRef.current?.then((un) => un())
  }
}, [dependencies])

// 事件处理器命名：on + 动作
const onFileDrop = async (event: Event<DragDropEvent>) => { }
```

#### 错误处理
```typescript
// 使用 try-catch 包裹 Tauri 调用
try {
  const result = await invoke<ImageCompreessInfo>("start_compress", { info, isCover })
} catch (error) {
  console.error("压缩失败:", error)
}
```

---

### 后端 (Rust)

#### 格式化 (rustfmt)
- **行宽**：120 字符
- **缩进**：4 空格
- **导入分组**：`imports_granularity = "Crate"`，`group_imports = "StdExternalCrate"`
- **Edition**：2021

#### 模块组织
```rust
// 1. 标准库
use std::{fs, path::PathBuf};

// 2. 外部 crate
use serde::{Deserialize, Serialize};
use tracing::error;

// 3. 本地模块
use crate::shared::error::OptionError;
use super::utils::mime::get_filetype_from_path;
```

#### 命名约定
- **结构体/枚举/Trait**：PascalCase (`ImageCompression`, `TauriError`)
- **函数/变量**：snake_case (`start_compress`, `file_type`)
- **常量**：UPPER_SNAKE_CASE (`MAX_QUALITY`)
- **模块**：snake_case (`src/window/command/`)

#### 错误处理
```rust
// 使用 thiserror 定义自定义错误
#[derive(thiserror::Error, Debug)]
pub enum TauriError {
    #[error("没有获取窗口")]
    NoWindow,
    
    #[error("JSON 错误: {0}")]
    Json(#[from] serde_json::Error),
}

// 实现 Serialize 以便返回给前端
impl serde::Serialize for TauriError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where S: serde::Serializer {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

// Tauri 命令返回 Result
#[tauri::command]
pub fn get_drag_files(files: Vec<String>) -> Result<Vec<ImageCompression>, TauriError> {
    // ...
}
```

#### Async/Tokio 模式
```rust
// 异步 Tauri 命令
#[tauri::command(rename_all = "snake_case")]
pub async fn start_compress(info: ImageCompression, is_cover: bool) -> Result<ImageCompression, TauriError> {
    let (tx, rx) = oneshot::channel::<ImageCompression>();
    
    let arc_info = Arc::new(RwLock::new(info));
    let clone_info = Arc::clone(&arc_info);
    
    tokio::spawn(async move {
        let mut rw_info = clone_info.write().await;
        rw_info.start_mem_compress(is_cover).await.unwrap();
        tx.send(rw_info.to_owned()).unwrap();
    });
    
    Ok(rx.await.unwrap())
}
```

#### Serde 约定
```rust
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]  // 枚举序列化为小写
pub enum CompressState {
    #[default]
    Compressing,
    Done,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct ImageCompression {
    #[serde(default)]  // 反序列化时使用默认值
    pub mem: Vec<u8>,
    
    #[serde(rename(serialize = "origin", deserialize = "origin"))]
    pub before_size: u64,  // 前端看到的是 "origin"
}
```

#### 日志记录
```rust
use tracing::{info, warn, error, debug};

// 使用 tracing 宏
info!("开始压缩: {}", file_name);
error!("压缩失败: {:?}", err);
```

---

## Tauri 特定约定

### 命令注册
```rust
// src-tauri/src/main.rs
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            close_splashscreen,
            get_drag_files,
            start_compress,
            js2rs,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 前端调用
```typescript
import { invoke } from "@tauri-apps/api/core"

// 调用 Rust 命令（参数使用 camelCase，自动转换为 snake_case）
const result = await invoke<ImageCompreessInfo>("start_compress", {
  info: imageInfo,
  isCover: true,
})
```

---

## 常见任务

### 添加新的 Tauri 命令
1. 在 `src-tauri/src/window/command/` 创建新文件
2. 定义命令函数（使用 `#[tauri::command]`）
3. 在 `src-tauri/src/main.rs` 注册命令
4. 在前端使用 `invoke()` 调用

### 添加新的前端页面
1. 在 `src/pages/` 创建页面组件
2. 在 `src/router/` 配置路由
3. 在 `src/typings/` 添加类型定义（如需要）

### 修改图片压缩逻辑
- 编辑 `src-tauri/src/compress/index.rs` 中的 `ImageCompression::start_mem_compress()`

---

## 注意事项

1. **类型安全**：前后端通信的数据结构必须匹配（Rust 的 `Serialize`/`Deserialize` ↔ TypeScript 类型）
2. **错误处理**：Rust 错误必须实现 `Serialize` 才能返回给前端
3. **异步操作**：Tauri 命令可以是同步或异步，前端始终使用 `await invoke()`
4. **路径处理**：使用 Tauri 的 `BaseDirectory` 处理跨平台路径
5. **性能**：图片压缩在 Tokio 线程池中执行，避免阻塞主线程
6. **构建配置**：
   - Debug 构建：`codegen-units = 16`（快速编译）
   - Release 构建：`lto = true`, `codegen-units = 1`, `opt-level = 3`（最大优化）

---

## 支持的图片格式

PNG, JPEG, GIF, WebP

---

## 相关文档

- [Tauri v2 文档](https://v2.tauri.app/)
- [React Router v7 文档](https://reactrouter.com/)
- [TailwindCSS v4 文档](https://tailwindcss.com/)
- [Tokio 文档](https://tokio.rs/)
