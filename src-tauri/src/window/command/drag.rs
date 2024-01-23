use serde::{Deserialize, Serialize};
use tracing::info;

#[derive(Serialize, Deserialize)]
pub struct DragFiles {
    pub files: Vec<String>,
}

#[tauri::command]
pub fn get_drag_files(drag: DragFiles) {
    let DragFiles { files, .. } = drag;
    print!("get_drag_files: {:?}", files);
    // info!("get_drag_files: {:?}", drag.files);
}
