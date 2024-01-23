import { defineConfig, loadEnv, normalizePath, searchForWorkspaceRoot } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig((config) => {
  const isDev = config.mode === "development";
  const isProd = config.mode === "production";

  const isServe = config.command === "serve";
  const isBuild = config.command === "build";

  const env = loadEnv(config.mode, process.cwd());

  return {
    plugins: [react()],

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
      port: 1420,
      strictPort: true,
      cors: true, // 配置 CORS 跨域
      watch: {
        // 3. tell vite to ignore watching `src-tauri`
        ignored: ["**/src-tauri/**"],
      },
    },

    resolve: {
      dedupe: [], // 未知 强制 Vite 始终将列出的依赖项解析为同一副本
      conditions: [], // 未知 解决程序包中 情景导出 时的其他允许条件
      mainFields: [], // 未知 解析包入口点尝试的字段列表
      //设置别名
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
      extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json"],
    },

    build: {
      target: ["es2015", "edge88", "firefox78", "chrome58", "safari14"], // 指定要支持的浏览器原生版本
      // cssTarget: "", // 允许用户为 CSS 的压缩设置一个不同的浏览器 target 与 build.target 一致
      // outDir: "dist",
      // assetsDir: "assets",
      cssCodeSplit: true, // 启用 CSS 代码拆分
      emptyOutDir: true, // 构建时清空目录
      chunkSizeWarningLimit: 500,
      assetsInlineLimit: 4096, // 图片转 base64 编码的阈值
      polyfillModulePreload: true, // 是否自动注入 module preload 的 polyfill
      reportCompressedSize: false, // 启用/禁用 gzip 压缩大小报告
      sourcemap: isServe, // 构建后是否生成 source map 文件。如果为 true，将会创建一个独立的 source map 文件。
      manifest: false, // 当设置为 true，构建后将会生成 manifest.json 文件
      // ssrManifest: false, // 构建不生成 SSR 的 manifest 文件
      // ssr: undefined, // 生成面向 SSR 的构建
      // write: true, // 启用将构建后的文件写入磁盘
      // brotliSize: true, // 启用 brotli 压缩大小报告
      // watch: null, // 设置为 {} 则会启用 rollup 的监听器
      // 可配置 terser 或 esbuild
      minify: "terser",
      // 代码压缩配置
      terserOptions: {
        // 生产环境移除 console
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          assetFileNames: `assets/[ext]/[name][extname]`,
          chunkFileNames: `js/chunks/[name].[hash].js`,
          entryFileNames: `js/[name].js`,
          // 在不配置 manualchunks 的情况下，rollup会将每个模块文件打包成一个单独的 js 文件，不会对 chunk 进行合并，
          // 这会导致 chunk 数量太多，有些文件只有 几 kb（触发同域名网络请求最大数量限制）
          manualChunks: (id: string) => {
            if (id.includes("/node_modules/lodash-es/")) return "lodash";
            if (id.includes("/node_modules/ua-parser-js/")) return "ua-parser-js";
            if (id.includes("/node_modules/jszip/")) return "jszip";
            if (id.includes("/node_modules/element-plus/")) return "element-plus";
            if (id.includes("/node_modules/")) return "vendor";
          },
          // rollup 在3.3之后的版本提供了一个实验性质的配置项 output.experimentalMinChunkSize，来合并小 chunk
          // 如果 chunk 小于这个值则会尝试跟其他 chunk 合并，它只对纯函数有作用，如果是 console.log 就会失效
          experimentalMinChunkSize: 5 * 1024, // 单位b
        },
        // Rollup 还提供了 treeshake.manualPureFunctions 参数来让开发者指定哪些函数是纯函数，所以可以这样配置
        // 在开发 JS 模块的时候要尽量避免模块副作用
        treeshake: {
          preset: "recommended",
          manualPureFunctions: ["console.log"],
        },
      },
    },
    optimizeDeps: {
      // !未知
      entries: ["/index.html"],
      // 是否开启强制依赖预构建。node_modules 中的依赖模块构建过一次就会缓存在 node_modules/.vite/deps 文件夹下，下一次会直接使用缓存的文件。
      // 而有时候我们想要修改依赖模块的代码，做一些测试或者打个补丁，这时候就要用到强制依赖预构建。
      // 除了这个方法，我们还可以通过删除 .vite 文件夹或运行 npx vite --force 来强制进行依赖预构建。
      force: false, // 强制进行依赖预构建
      exclude: [],
    },
    css: {
      modules: {
        scopeBehaviour: "local",
      },
      preprocessorOptions: {
        // 给含有中文的scss文件添加 @charset:UTF-8;
        charset: false,
        scss: {
          /* .scss全局预定义变量，引入多个文件 以;(分号分割)*/
          additionalData: `@use "@/css/device/device.mixin.scss" as *;`,
        },
      },
      // 可以查看 CSS 的源码
      devSourcemap: true,
    },
    json: {
      namedExports: true, // 是否支持从 .json 文件中进行按名导入
      stringify: false, //  开启此项，导入的 JSON 会被转换为 export default JSON.parse("...") 会禁用按名导入
    },
    preview: {
      port: 5000, // 指定开发服务器端口
      strictPort: false, // 若端口已被占用则会直接退出
      https: {}, // 启用 TLS + HTTP/2
      open: true, // 启动时自动在浏览器中打开应用程序
      proxy: {
        // 配置自定义代理规则
        "/api": {
          target: "http://jsonplaceholder.typicode.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
      cors: true, // 配置 CORS
    },
  };
});
