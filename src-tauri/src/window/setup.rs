use std::error::Error;

use tauri::App;
use tracing::info;

use crate::{
    constant::error::TauriError,
    utils::{debug::is_debug, log::tracing::init_tracing},
};

pub fn setup(app: &mut App) -> Result<(), Box<dyn Error>> {
    // let _docs_window = tauri::WindowBuilder::new(app, "external", tauri::WindowUrl::External("https://tauri.app/".parse()?)).build()?;
    // let _local_window = tauri::WindowBuilder::new(app, "local", tauri::WindowUrl::App("splash.html".into())).build()?;

    let log_path_buf = app.path_resolver().app_log_dir().ok_or(TauriError::NoPath)?;
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

    Ok(())
}
