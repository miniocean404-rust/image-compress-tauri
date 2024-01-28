use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::compress::{index::ImageCompression, utils::dir::glob_dir};

#[derive(Serialize, Deserialize)]
pub struct DragFiles {
    pub files: Vec<String>,
}

#[tauri::command]
pub fn get_drag_files(files: Vec<String>, quality: i8) -> Vec<ImageCompression> {
    files
        .iter()
        .map(|file| {
            let path = PathBuf::from(file);
            let files = glob_dir("*.{png,webp,gif,jpg,jpeg}", path.to_str().unwrap()).unwrap();
            files
                .into_iter()
                .map(|file| ImageCompression::new(file, quality).unwrap())
                .collect::<Vec<ImageCompression>>()
        })
        .flat_map(|e| e.into_iter())
        .collect::<Vec<ImageCompression>>()
}
