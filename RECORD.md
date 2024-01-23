## 学习文章地址

https://juejin.cn/post/7067342513920540686#heading-8

<!-- 获取文件进度条 -->

https://juejin.cn/post/7212819399115489335

https://juejin.cn/post/7093164755275218981

## 官方文档

tauri.config.json 文档：https://tauri.app/zh-cn/v1/api/config/
tauri 前端 Api: https://tauri.app/zh-cn/v1/api/js/
自定义窗口：https://tauri.app/zh-cn/v1/guides/features/window-customization

## 打包

`yarn tauri build`
该命令会将 Web 资源 与 Rust 代码一起嵌入到单个二进制文件中。

二进制文件本身将位于 src-tauri/target/release/[app name]
安装程序将位于 src-tauri/target/release/bundle/
