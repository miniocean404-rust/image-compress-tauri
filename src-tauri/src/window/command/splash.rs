use tauri::Manager;

// 创建一个 Rust 命令
// 以上 Rust 代码的执行逻辑是创建一个 close_splashscreen 函数用来关闭启动视图并展示主视图，并将这个函数注册为一个 Rust 命令，在应用初始化时进行注册，以便在 JavaScript 中可以动态调用该命令。
#[tauri::command(rename_all = "snake_case")]
pub fn close_splashscreen(window: tauri::WebviewWindow) -> Result<(), tauri::Error> {
    // Tauri v2: get_window 改为 get_webview_window
    // 关闭启动视图
    if let Some(splashscreen) = window.get_webview_window("splash") {
        splashscreen.close()?;
    }

    // 展示主视图
    if let Some(main) = window.get_webview_window("main") {
        main.show()?;
    }

    Ok(())
}
