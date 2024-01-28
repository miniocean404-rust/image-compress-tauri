use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tracing::info;

use crate::{compress::index::ImageCompression, utils::dir::glob_dir};

#[derive(Serialize, Deserialize)]
pub struct DragFiles {
    pub files: Vec<String>,
}

#[tauri::command]
pub fn get_drag_files(files: Vec<String>, quality: i8) -> Vec<Vec<ImageCompression>> {
    let a: Vec<Vec<ImageCompression>> = files
        .iter()
        .map(|file| {
            let path = PathBuf::from(file);
            let files = glob_dir("*.{png,webp,gif,jpg,jpeg}", path.to_str().unwrap()).unwrap();
            let imgs: Vec<ImageCompression> = files.into_iter().map(|file| ImageCompression::new(file, quality)).collect();

            imgs
        })
        .collect::<Vec<Vec<ImageCompression>>>();
    a
}
