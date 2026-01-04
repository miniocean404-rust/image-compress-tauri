use tauri::AppHandle;
use tokio::sync::mpsc;

use super::rs2js::rs2js;

// 接收命令的消息发送给 js 事件
pub async fn receive_rs2js_send_js2rs<R: tauri::Runtime>(mut rs2js_rx: mpsc::Receiver<String>, app_handle: &AppHandle<R>) {
    loop {
        if let Some(message) = rs2js_rx.recv().await {
            rs2js(message, app_handle);
        }
    }
}
