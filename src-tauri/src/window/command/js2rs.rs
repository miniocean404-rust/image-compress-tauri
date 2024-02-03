use crate::window::manage::AsyncProcInputTx;

#[tauri::command]
pub async fn js2rs(message: String, state: tauri::State<'_, AsyncProcInputTx>) -> Result<(), String> {
    let js2rs_tx = state.inner.lock().await;
    js2rs_tx.send(message).await.map_err(|e| e.to_string())
}
