use std::error::Error;

use tauri::App;
use tracing::info;

use crate::{constant::error::TauriError, utils::log::tracing::init_tracing};

pub fn setup(app: &mut App) -> Result<(), Box<dyn Error>> {
    // let _docs_window = tauri::WindowBuilder::new(app, "external", tauri::WindowUrl::External("https://tauri.app/".parse()?)).build()?;
    // let _local_window = tauri::WindowBuilder::new(app, "local", tauri::WindowUrl::App("splash.html".into())).build()?;

    if let Ok(current_dir) = std::env::current_dir() {
        println!("Current directory is: {:?}", current_dir);
    }

    let log_path_buf = app.path_resolver().app_log_dir().ok_or(TauriError::NoPath)?;
    let log_path = log_path_buf.to_str().ok_or(TauriError::NoPath)?;

    // 日志路径 windows ：C:\\Users\\ta\\AppData\\Roaming\\com.miniocean.compress.image\\logs
    let _guard = init_tracing(log_path)?;

    let cwd = std::env::current_dir()?;

    info!("process.cwd(): ------------ {:?}", cwd);

    Ok(())
}
