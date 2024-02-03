use tauri::Manager;

// https://juejin.cn/post/7223325932357894199
// rust 发送事件给 js
// A function that sends a message from Rust to JavaScript via a Tauri Event
pub fn rs2js<R: tauri::Runtime>(message: String, manager: &impl Manager<R>) {
    // tauri 包装 tokio 异步运行时：https://juejin.cn/post/7223325932357894199
    // tauri::async_runtime::set(tokio::runtime::Handle::current());
    manager.emit_all("event-name", message).unwrap();
}
