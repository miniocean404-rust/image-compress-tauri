use tauri::Emitter;

// https://juejin.cn/post/7223325932357894199
// rust 发送事件给 js
// A function that sends a message from Rust to JavaScript via a Tauri Event
pub fn rs2js<R: tauri::Runtime, E: Emitter<R>>(message: String, emitter: &E) {
    // tauri 包装 tokio 异步运行时：https://juejin.cn/post/7223325932357894199
    // tauri::async_runtime::set(tokio::runtime::Handle::current());
    // Tauri v2: emit_all 改为 emit
    emitter.emit("event-name", message).unwrap();
}
