## Core 文章

// 编解码参考：https://github.com/imazen/imageflow/blob/9ca1dbd50c7390d5953d711bf78b49ea5217aa60/imageflow_core/src/codecs/mozjpeg_decoder.rs#L17

## 学习文章地址

- splash:https://juejin.cn/post/7067342513920540686#heading-8
- 游戏登录器（进度条）：https://juejin.cn/post/7212819399115489335
- todo demo: https://juejin.cn/post/7093164755275218981
- 效率小工具：https://juejin.cn/post/7194780452106797117?searchId=202401262153271E54F50BC6C4D84DB7CE

# 官方文档

tauri.config.json 文档：https://tauri.app/zh-cn/v1/api/config/
tauri 前端 Api: https://tauri.app/zh-cn/v1/api/js/
自定义窗口：https://tauri.app/zh-cn/v1/guides/features/window-customization

# tauri.config.json

## 自定义的窗口

1. 可以是静态资源下的文件路径 例如：public 文件夹下的`index.html`
2. 自定义的窗口可以是 url 的 path 路径 例如：splash
   下方的配置就是 react 页面中的 pages 下的 splash 文件

```json
{
    "center": true,
    "width": 800,
    "height": 600,
    "decorations": false,
    "url": "splash",
    "label": "splash"
},
```

## 打包

`yarn tauri build`
该命令会将 Web 资源 与 Rust 代码一起嵌入到单个二进制文件中。

二进制文件本身将位于 src-tauri/target/release/[app name]
安装程序将位于 src-tauri/target/release/bundle/
