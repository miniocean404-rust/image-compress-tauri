use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tracing::info;

#[derive(Serialize, Deserialize)]
pub struct DragFiles {
    pub files: Vec<String>,
}

#[tauri::command]
pub fn get_drag_files(files: Vec<String>) {
    files.iter().for_each(|file| {
        let path = PathBuf::from(file);
        if let Ok(real_path) = path.canonicalize() {
            info!("get_drag_files: {:?}", real_path);
        } else {
            todo!()
        }
    });
}
