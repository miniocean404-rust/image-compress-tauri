use std::error::Error;

use tauri::{App, Manager};
use tokio::sync::mpsc;
use tracing::info;

use crate::{
    shared::error::TauriError,
    utils::{debug::is_debug, log::tracing::init_tracing},
    window::event::index::receive_rs2js_send_js2rs,
    window::tray::index::setup_tray,
};

pub fn get_setup(
    js2rs_rx: mpsc::Receiver<String>,
    rs2js_tx: mpsc::Sender<String>,
    rs2js_rx: mpsc::Receiver<String>,
) -> impl FnOnce(&mut App) -> Result<(), Box<dyn std::error::Error>> {
    |app: &mut App| -> Result<(), Box<dyn Error>> {
        // let _docs_window = tauri::WindowBuilder::new(app, "external", tauri::WindowUrl::External("https://tauri.app/".parse()?)).build()?;
        // let _local_window = tauri::WindowBuilder::new(app, "local", tauri::WindowUrl::App("splash.html".into())).build()?;

        // Tauri v2: path_resolver() 改为 path()
        let log_path_buf = app.path().app_log_dir().map_err(|_| TauriError::NoPath)?;
        let mut log_path = log_path_buf.to_str().ok_or(TauriError::NoPath)?;

        if is_debug() {
            log_path = "./logs";
        }

        // 日志路径 windows ：C:\\Users\\ta\\AppData\\Roaming\\com.miniocean.compress.image\\logs
        // Mac: /Users/user/Library/Logs/com.miniocean.compress.image
        // 打包需要开启 tauri 的 tracing
        let _guard = init_tracing(log_path)?;
        let cwd = std::env::current_dir()?;
        info!("process.cwd(): ------------ {:?}", cwd);

        // 设置系统托盘
        setup_tray(app)?;

        let app_handle = app.handle().clone();

        tauri::async_runtime::spawn(async move { receive_js2rs_send_rs2js(js2rs_rx, rs2js_tx).await });
        tauri::async_runtime::spawn(async move { receive_rs2js_send_js2rs(rs2js_rx, &app_handle).await });

        Ok(())
    }
}

// 接收命令的消息发送给 js 事件
async fn receive_js2rs_send_rs2js(
    mut js2rs_rx: mpsc::Receiver<String>,
    rs2js_tx: mpsc::Sender<String>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    while let Some(message) = js2rs_rx.recv().await {
        rs2js_tx.send(message).await?;
    }

    Ok(())
}
